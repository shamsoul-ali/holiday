// Provider branding and visual enhancement service
export interface ProviderBrand {
  name: string
  logo: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  badge: string
  features: string[]
  websiteUrl: string
  bookingUrl?: string
}

export const PROVIDER_BRANDS: Record<string, ProviderBrand> = {
  'booking.com': {
    name: 'Booking.com',
    logo: '🏨',
    colors: {
      primary: '#003580',
      secondary: '#0071c2', 
      accent: '#ffffff'
    },
    badge: 'World\'s #1 Hotel Site',
    features: ['Free cancellation', 'No booking fees', '24/7 support'],
    websiteUrl: 'https://booking.com',
    bookingUrl: 'https://booking.com/searchresults.html'
  },
  'agoda': {
    name: 'Agoda',
    logo: '🏖️',
    colors: {
      primary: '#ff5722',
      secondary: '#ff7043',
      accent: '#ffffff'
    },
    badge: 'Best Asian Hotels',
    features: ['Asia specialist', 'Local insights', 'Best rates guarantee'],
    websiteUrl: 'https://agoda.com'
  },
  'skyscanner': {
    name: 'Skyscanner',
    logo: '✈️',
    colors: {
      primary: '#00a8e6',
      secondary: '#0078a8',
      accent: '#ffffff'
    },
    badge: 'Flight Search Expert',
    features: ['Compare all airlines', 'Price alerts', 'Flexible dates'],
    websiteUrl: 'https://skyscanner.com'
  },
  'getyourguide': {
    name: 'GetYourGuide',
    logo: '🎯',
    colors: {
      primary: '#ff6900',
      secondary: '#e55a00',
      accent: '#ffffff'
    },
    badge: 'Activity Specialists',
    features: ['Skip-the-line tickets', 'Local experiences', 'Instant confirmation'],
    websiteUrl: 'https://getyourguide.com'
  },
  'rome2rio': {
    name: 'Rome2Rio',
    logo: '🚌',
    colors: {
      primary: '#34a853',
      secondary: '#2e8b47',
      accent: '#ffffff'
    },
    badge: 'Multi-modal Transport',
    features: ['All transport modes', '240+ countries', 'Door-to-door routes'],
    websiteUrl: 'https://rome2rio.com'
  },
  'uber': {
    name: 'Uber',
    logo: '🚗',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#ffffff'
    },
    badge: 'Premium Rides',
    features: ['Real-time tracking', 'Cashless payment', 'Professional drivers'],
    websiteUrl: 'https://uber.com'
  },
  'revolut': {
    name: 'Revolut',
    logo: '💳',
    colors: {
      primary: '#0075eb',
      secondary: '#005bb5',
      accent: '#ffffff'
    },
    badge: 'Travel Money Expert',
    features: ['No foreign fees', 'Real exchange rates', 'Instant notifications'],
    websiteUrl: 'https://revolut.com'
  },
  'wise': {
    name: 'Wise',
    logo: '🏦',
    colors: {
      primary: '#37517e',
      secondary: '#2a3d5f',
      accent: '#00b9ff'
    },
    badge: 'Multi-currency Account',
    features: ['Real exchange rates', '40+ currencies', 'Local account details'],
    websiteUrl: 'https://wise.com'
  },
  'xe': {
    name: 'XE Currency',
    logo: '💱',
    colors: {
      primary: '#e4002b',
      secondary: '#c4002b',
      accent: '#ffffff'
    },
    badge: 'Live Exchange Rates',
    features: ['Real-time rates', '180+ currencies', 'Rate alerts'],
    websiteUrl: 'https://xe.com'
  },
  'malaysia-airlines': {
    name: 'Malaysia Airlines',
    logo: '🇲🇾',
    colors: {
      primary: '#e30613',
      secondary: '#b30510',
      accent: '#ffffff'
    },
    badge: '5-Star Airline',
    features: ['Skytrax 5-star', 'Premium service', 'Modern fleet'],
    websiteUrl: 'https://malaysiaairlines.com'
  },
  'airasia': {
    name: 'AirAsia',
    logo: '🔴',
    colors: {
      primary: '#ff0000',
      secondary: '#cc0000',
      accent: '#ffffff'
    },
    badge: 'World\'s Best Low-Cost Airline',
    features: ['Low fares', 'Extensive network', 'Digital innovation'],
    websiteUrl: 'https://airasia.com'
  }
}

export const AI_BRANDING = {
  name: 'Holiday AI',
  logo: '🤖',
  colors: {
    primary: '#6366f1',
    secondary: '#4f46e5',
    accent: '#ffffff'
  },
  badge: 'AI-Powered Travel Intelligence',
  features: ['Smart recommendations', 'Budget optimization', 'Real-time comparison']
}

export function getProviderBrand(providerName: string): ProviderBrand | null {
  const key = providerName.toLowerCase().replace(/[^a-z]/g, '')
  return PROVIDER_BRANDS[key] || null
}

export function enhanceItineraryWithBranding(itinerary: any) {
  // Add provider branding to flight details
  if (itinerary.flightDetails) {
    const airline = itinerary.flightDetails.outbound.airline.toLowerCase()
    const airlineBrand = getProviderBrand(airline)
    
    if (airlineBrand) {
      itinerary.flightDetails.outbound.branding = airlineBrand
      itinerary.flightDetails.return.branding = airlineBrand
    }
  }

  // Add branding to hotel details
  if (itinerary.accommodationDetails) {
    itinerary.accommodationDetails.hotels = itinerary.accommodationDetails.hotels.map(hotel => ({
      ...hotel,
      branding: getProviderBrand('booking.com') || getProviderBrand('agoda')
    }))
  }

  // Add activity branding
  if (itinerary.days) {
    itinerary.days = itinerary.days.map(day => ({
      ...day,
      schedule: day.schedule?.map(item => {
        if (item.type === 'activity') {
          return {
            ...item,
            branding: getProviderBrand('getyourguide')
          }
        }
        if (item.type === 'transport' && item.activity.toLowerCase().includes('uber')) {
          return {
            ...item,
            branding: getProviderBrand('uber')
          }
        }
        if (item.type === 'transport' && !item.activity.toLowerCase().includes('flight')) {
          return {
            ...item,
            branding: getProviderBrand('rome2rio')
          }
        }
        return item
      })
    }))
  }

  // Add overall AI branding
  itinerary.aiBranding = AI_BRANDING

  // Add provider showcase
  itinerary.providerShowcase = [
    PROVIDER_BRANDS['booking.com'],
    PROVIDER_BRANDS['skyscanner'],
    PROVIDER_BRANDS['getyourguide'],
    PROVIDER_BRANDS['uber'],
    PROVIDER_BRANDS['revolut'],
    PROVIDER_BRANDS['xe']
  ]

  return itinerary
}

export function getProviderLogo(providerName: string): string {
  const brand = getProviderBrand(providerName)
  return brand?.logo || '🌐'
}

export function getProviderColors(providerName: string) {
  const brand = getProviderBrand(providerName)
  return brand?.colors || {
    primary: '#6366f1',
    secondary: '#4f46e5', 
    accent: '#ffffff'
  }
}

export function generateProviderBadge(providerName: string): string {
  const brand = getProviderBrand(providerName)
  return `${brand?.logo || '🌐'} ${brand?.badge || 'Trusted Provider'}`
}

export function getBookingUrl(providerName: string, itemDetails: any): string {
  const brand = getProviderBrand(providerName)
  
  if (providerName.toLowerCase().includes('booking')) {
    return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(itemDetails.destination)}`
  }
  
  if (providerName.toLowerCase().includes('skyscanner')) {
    return `https://www.skyscanner.com/routes/${itemDetails.origin}/${itemDetails.destination}/`
  }
  
  if (providerName.toLowerCase().includes('getyourguide')) {
    return `https://www.getyourguide.com/s/?q=${encodeURIComponent(itemDetails.destination)}`
  }
  
  return brand?.websiteUrl || '#'
}

// Enhanced pricing display with provider context
export function formatPriceWithProvider(price: number, currency: string, providerName: string) {
  const brand = getProviderBrand(providerName)
  const formattedPrice = `${currency === 'MYR' ? 'RM' : currency} ${price.toLocaleString()}`
  
  return {
    price: formattedPrice,
    provider: brand?.name || providerName,
    logo: brand?.logo || '🌐',
    badge: brand?.badge,
    colors: brand?.colors
  }
}

// Real-time status indicators
export function getRealTimeStatus(providerName: string) {
  // Simulate real-time status
  const statuses = ['Live prices', 'Updated 2 min ago', 'Real-time availability', 'Instant confirmation']
  return statuses[Math.floor(Math.random() * statuses.length)]
}

// Provider-specific features for each category
export function getProviderFeatures(category: string, providerName: string): string[] {
  const brand = getProviderBrand(providerName)
  
  if (!brand) {
    return ['Trusted provider', 'Secure booking', 'Customer support']
  }
  
  // Category-specific features
  const categoryFeatures = {
    flights: ['Compare all airlines', 'Flexible dates', 'Price alerts'],
    hotels: ['Free cancellation', 'Best rate guarantee', 'Instant confirmation'],
    activities: ['Skip-the-line access', 'Local guides', 'Mobile tickets'],
    transport: ['Real-time tracking', 'Multiple options', 'Door-to-door'],
    financial: ['No hidden fees', 'Real exchange rates', 'Instant transfers']
  }
  
  return categoryFeatures[category] || brand.features
}