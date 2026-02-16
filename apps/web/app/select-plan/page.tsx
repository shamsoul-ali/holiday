'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sparkles, Check, Star, Plane, Hotel, Utensils, Camera, Shield, Clock, Users, Calendar } from 'lucide-react'

interface Package {
  id: string
  tier: 'Budget' | 'Standard' | 'Luxury'
  tagline: string
  price: number
  originalPrice?: number
  savings?: number
  features: string[]
  highlights: {
    flights: string
    accommodation: string
    meals: string
    activities: string
    extras: string[]
  }
  recommended?: boolean
  color: {
    gradient: string
    badge: string
    bg: string
  }
}

export default function SelectPlanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Get trip details from URL params
  const destination = searchParams.get('destination') || 'Tokyo, Japan'
  const budget = parseInt(searchParams.get('budget') || '10000')
  const travelers = parseInt(searchParams.get('travelers') || '2')
  const duration = parseInt(searchParams.get('duration') || '5')
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''

  // Generate AI-powered packages based on budget
  const packages: Package[] = [
    {
      id: 'budget',
      tier: 'Budget',
      tagline: 'Smart savings, great memories',
      price: Math.round(budget * 0.6),
      originalPrice: Math.round(budget * 0.75),
      savings: Math.round(budget * 0.15),
      features: [
        'Economy class flights',
        '3-star hotels or hostels',
        'Self-guided tours',
        'Public transportation',
        'Local street food experiences',
        'Free walking tours',
        'Basic travel insurance'
      ],
      highlights: {
        flights: 'Economy with 1 stop',
        accommodation: '3-star hotel or hostel',
        meals: 'Breakfast included',
        activities: '3 budget-friendly activities',
        extras: ['Airport transfers', 'City maps', 'Travel tips']
      },
      color: {
        gradient: 'from-green-500 to-emerald-600',
        badge: 'bg-green-100 text-green-700',
        bg: 'bg-green-50'
      }
    },
    {
      id: 'standard',
      tier: 'Standard',
      tagline: 'Perfect balance of comfort & value',
      price: Math.round(budget * 0.85),
      originalPrice: Math.round(budget * 1.0),
      savings: Math.round(budget * 0.15),
      features: [
        'Economy or Premium Economy flights',
        '4-star hotels',
        'Mix of guided & self-guided tours',
        'Private transfers included',
        'Curated restaurant recommendations',
        'Skip-the-line tickets',
        'Comprehensive travel insurance',
        'Local SIM card included'
      ],
      highlights: {
        flights: 'Premium Economy or direct flights',
        accommodation: '4-star boutique hotel',
        meals: 'Breakfast + 2 dinners',
        activities: '5 curated experiences',
        extras: ['Private airport transfer', 'City pass', 'Local guide', 'Travel insurance']
      },
      recommended: true,
      color: {
        gradient: 'from-blue-600 to-purple-600',
        badge: 'bg-blue-100 text-blue-700',
        bg: 'bg-blue-50'
      }
    },
    {
      id: 'luxury',
      tier: 'Luxury',
      tagline: 'Premium experiences, zero compromises',
      price: Math.round(budget * 1.2),
      originalPrice: Math.round(budget * 1.5),
      savings: Math.round(budget * 0.3),
      features: [
        'Business class flights',
        '5-star luxury hotels',
        'Private guided tours',
        'Luxury car with driver',
        'Fine dining experiences',
        'VIP skip-the-line access',
        'Premium travel insurance',
        'Concierge service 24/7',
        'Spa & wellness sessions',
        'Exclusive access to events'
      ],
      highlights: {
        flights: 'Business class direct',
        accommodation: '5-star luxury resort',
        meals: 'All meals at premium venues',
        activities: '8 exclusive VIP experiences',
        extras: ['Private chauffeur', 'Airport lounge', 'Personal concierge', 'Spa treatments', 'Premium insurance']
      },
      color: {
        gradient: 'from-amber-500 to-orange-600',
        badge: 'bg-amber-100 text-amber-700',
        bg: 'bg-amber-50'
      }
    }
  ]

  const handleSelectPlan = (packageId: string) => {
    setSelectedPlan(packageId)
  }

  const handleContinue = () => {
    if (!selectedPlan) return

    setIsLoading(true)
    const selectedPackage = packages.find(p => p.id === selectedPlan)

    // Navigate to customize page with selected plan
    const params = new URLSearchParams({
      destination,
      budget: selectedPackage?.price.toString() || budget.toString(),
      travelers: travelers.toString(),
      duration: duration.toString(),
      checkIn,
      checkOut,
      plan: selectedPlan,
      tier: selectedPackage?.tier || 'Standard'
    })

    setTimeout(() => {
      router.push(`/customize?${params.toString()}`)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Select Your Perfect Plan</h1>
              <p className="text-sm text-gray-600 mt-1">
                AI-curated packages for {destination} • {duration} days • {travelers} travelers
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

      {/* Trip Summary Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5" />
              <span className="font-medium">{destination}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{duration} days</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{travelers} travelers</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>Budget: RM {budget.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Message */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">AI Recommendation</h3>
              <p className="text-gray-700">
                Based on your budget of <span className="font-semibold">RM {budget.toLocaleString()}</span> for {travelers} travelers,
                we've curated 3 personalized packages. The <span className="font-semibold text-blue-600">Standard Plan</span> offers
                the best balance of comfort and value for your trip to {destination}.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 cursor-pointer ${
                selectedPlan === pkg.id
                  ? 'ring-4 ring-offset-2 ring-blue-500 transform scale-105'
                  : 'hover:shadow-2xl hover:scale-102'
              } ${pkg.recommended ? 'md:-mt-4 md:mb-4' : ''}`}
              onClick={() => handleSelectPlan(pkg.id)}
            >
              {/* Recommended Badge */}
              {pkg.recommended && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-bl-2xl text-sm font-bold flex items-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  RECOMMENDED
                </div>
              )}

              {/* Header */}
              <div className={`bg-gradient-to-r ${pkg.color.gradient} text-white p-6 pb-8`}>
                <h3 className="text-2xl font-bold mb-1">{pkg.tier}</h3>
                <p className="text-white/90 text-sm mb-4">{pkg.tagline}</p>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">RM {pkg.price.toLocaleString()}</span>
                  {pkg.originalPrice && (
                    <span className="text-white/70 line-through text-lg">RM {pkg.originalPrice.toLocaleString()}</span>
                  )}
                </div>
                <p className="text-white/80 text-sm mt-1">Total for {travelers} travelers</p>

                {pkg.savings && (
                  <div className="mt-3 inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                    Save RM {pkg.savings.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Highlights */}
              <div className={`${pkg.color.bg} p-6 space-y-3`}>
                <div className="flex items-start gap-3">
                  <Plane className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">FLIGHTS</p>
                    <p className="text-sm text-gray-900 font-semibold">{pkg.highlights.flights}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Hotel className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">ACCOMMODATION</p>
                    <p className="text-sm text-gray-900 font-semibold">{pkg.highlights.accommodation}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Utensils className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">MEALS</p>
                    <p className="text-sm text-gray-900 font-semibold">{pkg.highlights.meals}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Camera className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 font-medium">ACTIVITIES</p>
                    <p className="text-sm text-gray-900 font-semibold">{pkg.highlights.activities}</p>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="p-6 space-y-2.5">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  What's Included
                </h4>
                {pkg.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Select Button */}
              <div className="p-6 pt-0">
                <button
                  className={`w-full py-3.5 px-6 rounded-xl font-bold transition-all ${
                    selectedPlan === pkg.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : `bg-gradient-to-r ${pkg.color.gradient} text-white hover:shadow-lg`
                  }`}
                >
                  {selectedPlan === pkg.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" />
                      Selected
                    </span>
                  ) : (
                    'Select This Plan'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      {selectedPlan && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selected Plan</p>
                <p className="text-lg font-bold text-gray-900">
                  {packages.find(p => p.id === selectedPlan)?.tier} Plan - RM{' '}
                  {packages.find(p => p.id === selectedPlan)?.price.toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleContinue}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 px-8 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg flex items-center gap-2"
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
                    Continue to Customize
                    <Sparkles className="w-5 h-5" />
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
