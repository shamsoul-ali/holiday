'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Calendar, DollarSign, Users, Heart, Sparkles,
  ArrowRight, ArrowLeft, Edit2, Check, Plane, Hotel,
  UtensilsCrossed, Camera, Sun, Mountain, Loader2
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

type Step = 'destination' | 'budget' | 'preferences' | 'ai-or-manual' | 'loading'

export default function PlanTripPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState<Step>('destination')
  const [formData, setFormData] = useState({
    destination: '',
    departureCountry: 'Malaysia',
    checkIn: '',
    checkOut: '',
    budget: 5000,
    travelers: 2,
    children: 0,
    style: 'comfort',
    interests: [] as string[],
    letAISuggest: false,
  })

  // Pre-fill form data from URL parameters
  useEffect(() => {
    const destination = searchParams.get('destination')
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const adults = searchParams.get('adults')
    const children = searchParams.get('children')

    if (destination || checkIn || checkOut || adults || children) {
      setFormData(prev => ({
        ...prev,
        destination: destination || prev.destination,
        checkIn: checkIn || prev.checkIn,
        checkOut: checkOut || prev.checkOut,
        travelers: adults ? parseInt(adults) : prev.travelers,
        children: children ? parseInt(children) : prev.children,
      }))

      // If dates are filled, skip to budget step
      if (checkIn && checkOut) {
        setCurrentStep('budget')
      }
    }
  }, [searchParams])

  const interests = [
    { id: 'food', label: 'Food & Cuisine', icon: UtensilsCrossed },
    { id: 'culture', label: 'Culture & History', icon: Camera },
    { id: 'beach', label: 'Beach & Relaxation', icon: Sun },
    { id: 'adventure', label: 'Adventure', icon: Mountain },
    { id: 'shopping', label: 'Shopping', icon: Heart },
    { id: 'nature', label: 'Nature & Wildlife', icon: Mountain },
  ]

  const travelStyles = [
    { id: 'budget', label: 'Budget-Friendly', desc: 'Great value & savings' },
    { id: 'comfort', label: 'Comfort', desc: 'Balance of value & quality' },
    { id: 'luxury', label: 'Luxury', desc: 'Premium experience' },
  ]

  const toggleInterest = (id: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id]
    }))
  }

  const handleNext = () => {
    if (currentStep === 'destination') setCurrentStep('budget')
    else if (currentStep === 'budget') setCurrentStep('preferences')
    else if (currentStep === 'preferences') setCurrentStep('ai-or-manual')
  }

  const handleBack = () => {
    if (currentStep === 'budget') setCurrentStep('destination')
    else if (currentStep === 'preferences') setCurrentStep('budget')
    else if (currentStep === 'ai-or-manual') setCurrentStep('preferences')
  }

  const handleAISearch = async () => {
    setCurrentStep('loading')
    const params = new URLSearchParams({
      destination: formData.destination || 'AI-SUGGEST',
      departureCountry: formData.departureCountry,
      budget: formData.budget.toString(),
      travelers: formData.travelers.toString(),
      duration: calculateDuration(),
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      style: formData.style,
      interests: formData.interests.join(','),
    })

    // Simulate AI processing then go to plan selection
    setTimeout(() => {
      router.push(`/select-plan?${params.toString()}`)
    }, 2000)
  }

  const handleManualSearch = () => {
    const params = new URLSearchParams({
      destination: formData.destination,
      departureCountry: formData.departureCountry,
      budget: formData.budget.toString(),
      travelers: formData.travelers.toString(),
      duration: calculateDuration(),
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      style: formData.style,
      interests: formData.interests.join(','),
    })
    router.push(`/select-plan?${params.toString()}`)
  }

  const calculateDuration = () => {
    if (!formData.checkIn || !formData.checkOut) return '1-week'
    const days = Math.ceil((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24))
    if (days <= 3) return '3-days'
    if (days <= 7) return '1-week'
    if (days <= 14) return '2-weeks'
    return '1-month'
  }

  const isStepComplete = (step: Step) => {
    if (step === 'destination') return formData.checkIn && formData.checkOut
    if (step === 'budget') return formData.budget > 0 && formData.travelers > 0
    if (step === 'preferences') return formData.interests.length > 0
    return false
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Progress Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="text-xl font-bold text-gray-900">
              Holiday<span className="text-blue-600">AI</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-colors ${currentStep === 'destination' ? 'bg-blue-600' : isStepComplete('destination') ? 'bg-green-500' : 'bg-gray-300'}`} />
              <div className={`w-2 h-2 rounded-full transition-colors ${currentStep === 'budget' ? 'bg-blue-600' : isStepComplete('budget') ? 'bg-green-500' : 'bg-gray-300'}`} />
              <div className={`w-2 h-2 rounded-full transition-colors ${currentStep === 'preferences' ? 'bg-blue-600' : isStepComplete('preferences') ? 'bg-green-500' : 'bg-gray-300'}`} />
              <div className={`w-2 h-2 rounded-full transition-colors ${currentStep === 'ai-or-manual' ? 'bg-blue-600' : 'bg-gray-300'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {/* Step 1: Destination & Dates */}
          {currentStep === 'destination' && (
            <motion.div
              key="destination"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Where would you like to go?
                </h1>
                <p className="text-lg text-gray-600">
                  Tell us your travel dates and we'll help plan the perfect trip
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                {/* Departure Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departing from
                  </label>
                  <select
                    value={formData.departureCountry}
                    onChange={(e) => setFormData({ ...formData, departureCountry: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Malaysia">Malaysia</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Thailand">Thailand</option>
                  </select>
                </div>

                {/* Destination (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination <span className="text-gray-400 text-xs">(Optional - or let AI suggest)</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      placeholder="e.g. Tokyo, Paris, or leave blank for AI suggestions"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-in
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.checkIn}
                        onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-out
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.checkOut}
                        onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                        min={formData.checkIn || new Date().toISOString().split('T')[0]}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  disabled={!formData.checkIn || !formData.checkOut}
                  className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Budget & Travelers */}
          {currentStep === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-12">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  What's your budget?
                </h1>
                <p className="text-lg text-gray-600">
                  Set your budget and tell us who's traveling
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
                {/* Budget Slider */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700">
                      Total Budget
                    </label>
                    <div className="text-2xl font-bold text-blue-600">
                      RM {formData.budget.toLocaleString()}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="500"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>RM 1,000</span>
                    <span>RM 50,000</span>
                  </div>
                </div>

                {/* Travelers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Adults
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setFormData({ ...formData, travelers: Math.max(1, formData.travelers - 1) })}
                        className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        -
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-3xl font-bold text-gray-900">{formData.travelers}</div>
                      </div>
                      <button
                        onClick={() => setFormData({ ...formData, travelers: formData.travelers + 1 })}
                        className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Children
                    </label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setFormData({ ...formData, children: Math.max(0, formData.children - 1) })}
                        className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        -
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-3xl font-bold text-gray-900">{formData.children}</div>
                      </div>
                      <button
                        onClick={() => setFormData({ ...formData, children: formData.children + 1 })}
                        className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Preferences */}
          {currentStep === 'preferences' && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-12">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  What are you interested in?
                </h1>
                <p className="text-lg text-gray-600">
                  Select your travel style and interests
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
                {/* Travel Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Travel Style
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {travelStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setFormData({ ...formData, style: style.id })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.style === style.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">{style.label}</div>
                        <div className="text-sm text-gray-600 mt-1">{style.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Interests (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {interests.map((interest) => {
                      const Icon = interest.icon
                      const isSelected = formData.interests.includes(interest.id)
                      return (
                        <button
                          key={interest.id}
                          onClick={() => toggleInterest(interest.id)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                          <div className="text-sm font-medium text-gray-900">{interest.label}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  disabled={formData.interests.length === 0}
                  className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: AI or Manual */}
          {currentStep === 'ai-or-manual' && (
            <motion.div
              key="ai-or-manual"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-12">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  How would you like to proceed?
                </h1>
                <p className="text-lg text-gray-600">
                  Let AI suggest destinations or search manually
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Suggestion */}
                <button
                  onClick={handleAISearch}
                  className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold">AI Suggestion</h3>
                    <p className="text-white/90">
                      Let our AI recommend the best destinations based on your preferences and budget
                    </p>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Check className="w-4 h-4" />
                      <span>Personalized recommendations</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Check className="w-4 h-4" />
                      <span>Best value for money</span>
                    </div>
                  </div>
                </button>

                {/* Manual Search */}
                <button
                  onClick={handleManualSearch}
                  disabled={!formData.destination}
                  className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-600 hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Manual Search</h3>
                    <p className="text-gray-600">
                      Search for your chosen destination: {formData.destination || 'Enter destination above'}
                    </p>
                    {!formData.destination && (
                      <p className="text-sm text-red-600">
                        Please enter a destination in Step 1
                      </p>
                    )}
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {currentStep === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                AI is crafting your perfect itinerary...
              </h2>
              <p className="text-gray-600">
                Analyzing {formData.interests.length} interests, RM {formData.budget.toLocaleString()} budget
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
