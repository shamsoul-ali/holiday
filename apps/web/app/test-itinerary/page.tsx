'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { sampleDetailedItinerary } from '@/lib/sample-detailed-itinerary'

export default function TestItineraryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading and redirect to the detailed itinerary page
    const timer = setTimeout(() => {
      const encodedData = encodeURIComponent(JSON.stringify(sampleDetailedItinerary))
      router.push(`/itinerary/${sampleDetailedItinerary.id}?data=${encodedData}`)
    }, 1000)

    return () => clearTimeout(timer)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-8">
            <div className="w-full h-full border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="text-white/60 text-lg">Loading detailed itinerary...</p>
          <p className="text-white/40 text-sm mt-2">Showcasing enhanced Daily Itinerary features</p>
        </div>
      </div>
    )
  }

  return null
}