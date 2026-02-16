'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface DestinationResult {
  destination_code: string
  name: string
  country: string
  region: string
  coordinates: {
    latitude: number
    longitude: number
  }
  popularity_score: number
  from_price: {
    amount: number
    currency: string
    flight_duration?: string
  }
  weather_info?: {
    current_temp: number
    condition: string
    humidity: number
  }
  travel_requirements: {
    visa_required: boolean
    vaccination_required: boolean
    passport_validity_months: number
  }
  highlights: string[]
  tags: string[]
  best_flight_offer?: {
    airline: string
    flight_number: string
    departure: string
    arrival: string
    duration: string
    price: number
  }
}

export interface UseDestinationSearchOptions {
  origin?: string
  budget?: number
  currency?: string
  departureDate?: string
  returnDate?: string
  debounceMs?: number
  limit?: number
}

export interface UseDestinationSearchReturn {
  query: string
  setQuery: (query: string) => void
  results: DestinationResult[]
  loading: boolean
  error: string | null
  popularDestinations: DestinationResult[]
  clearResults: () => void
  selectDestination: (destination: DestinationResult) => void
}

// Cache for storing search results
const searchCache = new Map<string, { results: DestinationResult[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useDestinationSearch(options: UseDestinationSearchOptions = {}): UseDestinationSearchReturn {
  const {
    origin = 'KUL',
    budget = 5000,
    currency = 'MYR',
    departureDate,
    returnDate,
    debounceMs = 300,
    limit = 8
  } = options

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DestinationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [popularDestinations, setPopularDestinations] = useState<DestinationResult[]>([])

  const abortControllerRef = useRef<AbortController | null>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load popular destinations on mount
  useEffect(() => {
    loadPopularDestinations()
  }, [origin, budget, currency])

  const loadPopularDestinations = async () => {
    try {
      const cacheKey = `popular_${origin}_${budget}_${currency}`
      const cached = searchCache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setPopularDestinations(cached.results)
        return
      }

      const params = new URLSearchParams({
        origin,
        budget: budget.toString(),
        currency,
        limit: '12'
      })

      if (departureDate) params.append('departure_date', departureDate)
      if (returnDate) params.append('return_date', returnDate)

      const response = await fetch(`/api/destinations/search?${params}`, {
        signal: AbortSignal.timeout(10000)
      })

      if (response.ok) {
        const data = await response.json()
        const destinations = data.results || []
        
        setPopularDestinations(destinations)
        searchCache.set(cacheKey, { results: destinations, timestamp: Date.now() })
      }
    } catch (error) {
      console.error('Error loading popular destinations:', error)
      // Set fallback popular destinations
      setPopularDestinations(getFallbackDestinations())
    }
  }

  const searchDestinations = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    // Check cache first
    const cacheKey = `search_${searchQuery}_${origin}_${budget}_${currency}`
    const cached = searchCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setResults(cached.results)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      const params = new URLSearchParams({
        q: searchQuery,
        origin,
        budget: budget.toString(),
        currency,
        limit: limit.toString(),
        quick: 'true' // Enable quick search mode for autocomplete
      })

      if (departureDate) params.append('departure_date', departureDate)
      if (returnDate) params.append('return_date', returnDate)

      const response = await fetch(`/api/destinations/search?${params}`, {
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const data = await response.json()
      const destinations = data.results || []

      setResults(destinations)
      
      // Cache the results
      searchCache.set(cacheKey, { results: destinations, timestamp: Date.now() })

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Destination search error:', error)
        setError('Search failed. Please try again.')
        setResults([])
      }
    } finally {
      setLoading(false)
    }
  }, [origin, budget, currency, departureDate, returnDate, limit])

  // Debounced search effect
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      searchDestinations(query)
    }, debounceMs)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [query, searchDestinations, debounceMs])

  const clearResults = useCallback(() => {
    setQuery('')
    setResults([])
    setError(null)
  }, [])

  const selectDestination = useCallback((destination: DestinationResult) => {
    setQuery(destination.name)
    setResults([])
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    popularDestinations,
    clearResults,
    selectDestination
  }
}

function getFallbackDestinations(): DestinationResult[] {
  return [
    {
      destination_code: "BKK",
      name: "Bangkok, Thailand",
      country: "Thailand",
      region: "Southeast Asia",
      coordinates: { latitude: 13.7563, longitude: 100.5018 },
      popularity_score: 95.0,
      from_price: { amount: 580, currency: "MYR", flight_duration: "2h 30m" },
      travel_requirements: { visa_required: false, vaccination_required: false, passport_validity_months: 6 },
      highlights: ["Ancient Temples", "Street Food", "Floating Markets", "Thai Massage"],
      tags: ["Halal-friendly", "Budget-friendly", "Cultural"]
    },
    {
      destination_code: "SIN",
      name: "Singapore",
      country: "Singapore", 
      region: "Southeast Asia",
      coordinates: { latitude: 1.3521, longitude: 103.8198 },
      popularity_score: 90.0,
      from_price: { amount: 320, currency: "MYR", flight_duration: "1h 30m" },
      travel_requirements: { visa_required: false, vaccination_required: false, passport_validity_months: 6 },
      highlights: ["Marina Bay Sands", "Gardens by the Bay", "Hawker Centers", "Shopping"],
      tags: ["Family-friendly", "Modern", "Halal-friendly"]
    },
    {
      destination_code: "CGK",
      name: "Jakarta, Indonesia",
      country: "Indonesia",
      region: "Southeast Asia", 
      coordinates: { latitude: -6.2088, longitude: 106.8456 },
      popularity_score: 85.0,
      from_price: { amount: 450, currency: "MYR", flight_duration: "2h 15m" },
      travel_requirements: { visa_required: false, vaccination_required: false, passport_validity_months: 6 },
      highlights: ["Cultural Heritage", "National Monument", "Old Batavia", "Indonesian Cuisine"],
      tags: ["Halal-friendly", "Budget-friendly", "Cultural"]
    },
    {
      destination_code: "NRT",
      name: "Tokyo, Japan",
      country: "Japan",
      region: "East Asia",
      coordinates: { latitude: 35.6762, longitude: 139.6503 },
      popularity_score: 92.0,
      from_price: { amount: 1200, currency: "MYR", flight_duration: "7h" },
      travel_requirements: { visa_required: false, vaccination_required: false, passport_validity_months: 6 },
      highlights: ["Cherry Blossoms", "Modern Culture", "Traditional Temples", "Sushi"],
      tags: ["Family-friendly", "Modern", "Cultural"]
    }
  ]
}