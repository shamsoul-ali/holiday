'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Minus, Check, Star, Shield, Wifi, Car, Utensils, Sparkles, Plane, Camera, Coffee, Zap } from 'lucide-react'

interface AddOn {
  id: string
  name: string
  description: string
  price: number
  icon: any
  category: 'insurance' | 'transport' | 'meals' | 'activities' | 'comfort' | 'vip'
  recommended?: boolean
  popular?: boolean
}

export default function CustomizePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const destination = searchParams.get('destination') || 'Tokyo, Japan'
  const basePrice = parseInt(searchParams.get('budget') || '10000')
  const travelers = parseInt(searchParams.get('travelers') || '2')
  const duration = parseInt(searchParams.get('duration') || '5')
  const tier = searchParams.get('tier') || 'Standard'
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''

  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Add-ons catalog
  const addOns: AddOn[] = [
    {
      id: 'travel-insurance-premium',
      name: 'Premium Travel Insurance',
      description: 'Medical coverage up to RM 500,000, trip cancellation, lost baggage',
      price: 450,
      icon: Shield,
      category: 'insurance',
      recommended: true
    },
    {
      id: 'airport-lounge',
      name: 'Airport Lounge Access',
      description: 'Complimentary food, drinks, WiFi, and showers at departure & arrival',
      price: 280,
      icon: Coffee,
      category: 'comfort',
      popular: true
    },
    {
      id: 'private-transfers',
      name: 'Private Airport Transfers',
      description: 'Luxury car pickup & drop-off at both airports',
      price: 520,
      icon: Car,
      category: 'transport',
      recommended: true
    },
    {
      id: 'unlimited-data',
      name: 'Unlimited 5G Data SIM',
      description: 'High-speed internet throughout your trip, unlimited data',
      price: 180,
      icon: Wifi,
      category: 'comfort',
      popular: true
    },
    {
      id: 'food-tour',
      name: 'Private Food Tour',
      description: 'Half-day guided culinary experience with local chef',
      price: 680,
      icon: Utensils,
      category: 'activities'
    },
    {
      id: 'photography-session',
      name: 'Professional Photo Session',
      description: '2-hour photoshoot at iconic locations, 50 edited photos',
      price: 950,
      icon: Camera,
      category: 'activities',
      popular: true
    },
    {
      id: 'fast-track',
      name: 'Fast Track Security',
      description: 'Skip queues at immigration and security checkpoints',
      price: 220,
      icon: Zap,
      category: 'vip'
    },
    {
      id: 'seat-upgrade',
      name: 'Extra Legroom Seats',
      description: 'Premium economy seats with 50% more legroom',
      price: 850,
      icon: Plane,
      category: 'comfort'
    },
    {
      id: 'all-meals',
      name: 'All Meals Package',
      description: 'Breakfast, lunch & dinner at curated restaurants',
      price: 1200,
      icon: Utensils,
      category: 'meals',
      recommended: true
    },
    {
      id: 'vip-concierge',
      name: '24/7 VIP Concierge',
      description: 'Personal concierge for reservations, translations, emergencies',
      price: 1500,
      icon: Star,
      category: 'vip'
    },
    {
      id: 'skip-the-line',
      name: 'Skip-the-Line Passes',
      description: 'Fast-track entry to top 5 attractions',
      price: 380,
      icon: Zap,
      category: 'activities',
      popular: true
    },
    {
      id: 'spa-package',
      name: 'Wellness & Spa Package',
      description: '3 spa treatments at 5-star hotel spa',
      price: 890,
      icon: Sparkles,
      category: 'comfort'
    }
  ]

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns(prev =>
      prev.includes(addOnId)
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    )
  }

  const calculateTotal = () => {
    const addOnsTotal = selectedAddOns.reduce((sum, id) => {
      const addOn = addOns.find(a => a.id === id)
      return sum + (addOn?.price || 0)
    }, 0)
    return basePrice + addOnsTotal
  }

  const handleContinue = () => {
    setIsLoading(true)
    const params = new URLSearchParams({
      destination,
      budget: calculateTotal().toString(),
      basePrice: basePrice.toString(),
      travelers: travelers.toString(),
      duration: duration.toString(),
      tier,
      checkIn,
      checkOut,
      addOns: selectedAddOns.join(',')
    })

    setTimeout(() => {
      router.push(`/select-flights?${params.toString()}`)
    }, 600)
  }

  const getCategoryTitle = (category: string) => {
    const titles: Record<string, string> = {
      insurance: 'Protection & Insurance',
      transport: 'Transportation',
      meals: 'Dining Experiences',
      activities: 'Activities & Tours',
      comfort: 'Comfort & Convenience',
      vip: 'VIP Services'
    }
    return titles[category] || category
  }

  const categories = Array.from(new Set(addOns.map(a => a.category)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customize Your Trip</h1>
              <p className="text-sm text-gray-600 mt-1">
                {tier} Plan • {destination} • {duration} days
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

      {/* Upsell Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Enhance Your Experience</h2>
          </div>
          <p className="text-white/90">
            Add these carefully curated extras to make your trip unforgettable
          </p>
        </div>
      </div>

      {/* Add-ons by Category */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {categories.map(category => {
          const categoryAddOns = addOns.filter(a => a.category === category)

          return (
            <div key={category} className="mb-12">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                {getCategoryTitle(category)}
                <span className="text-sm font-normal text-gray-500">
                  ({categoryAddOns.length} options)
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryAddOns.map(addOn => {
                  const Icon = addOn.icon
                  const isSelected = selectedAddOns.includes(addOn.id)

                  return (
                    <div
                      key={addOn.id}
                      className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? 'ring-4 ring-purple-500 ring-offset-2 transform scale-105'
                          : 'hover:shadow-2xl hover:scale-102'
                      }`}
                      onClick={() => toggleAddOn(addOn.id)}
                    >
                      {/* Badges */}
                      <div className="absolute top-3 right-3 flex gap-2">
                        {addOn.recommended && (
                          <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            Recommended
                          </span>
                        )}
                        {addOn.popular && (
                          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            🔥 Popular
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-purple-100' : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-7 h-7 ${isSelected ? 'text-purple-600' : 'text-gray-600'}`} />
                          </div>

                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">{addOn.name}</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{addOn.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div>
                            <span className="text-2xl font-bold text-gray-900">RM {addOn.price.toLocaleString()}</span>
                            <span className="text-sm text-gray-500 ml-1">total</span>
                          </div>

                          <button
                            className={`p-3 rounded-xl font-bold transition-all ${
                              isSelected
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {isSelected ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Plus className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-purple-500/5 pointer-events-none" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Summary */}
      {selectedAddOns.length > 0 && (
        <div className="fixed bottom-24 right-6 bg-white rounded-2xl shadow-2xl p-6 max-w-sm border-2 border-purple-200">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Added Extras ({selectedAddOns.length})
          </h4>
          <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
            {selectedAddOns.map(id => {
              const addOn = addOns.find(a => a.id === id)
              return (
                <div key={id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{addOn?.name}</span>
                  <span className="font-semibold text-gray-900">RM {addOn?.price.toLocaleString()}</span>
                </div>
              )
            })}
          </div>
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Base Package</span>
              <span>RM {basePrice.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Extras</span>
              <span>RM {(calculateTotal() - basePrice).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between font-bold text-lg text-gray-900 mt-2">
              <span>New Total</span>
              <span className="text-purple-600">RM {calculateTotal().toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Trip Cost</p>
              <div className="flex items-baseline gap-3">
                <p className="text-2xl font-bold text-gray-900">
                  RM {calculateTotal().toLocaleString()}
                </p>
                {selectedAddOns.length > 0 && (
                  <p className="text-sm text-gray-500">
                    (Base: RM {basePrice.toLocaleString()} + {selectedAddOns.length} extras)
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedAddOns([])}
                disabled={selectedAddOns.length === 0}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear All
              </button>
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
                    Continue to Flights
                    <Plane className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
