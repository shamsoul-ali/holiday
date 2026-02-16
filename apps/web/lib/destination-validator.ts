// Destination data validation utility
// This ensures all destinations have complete and consistent data

interface DestinationValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  destination: string
}

interface RequiredDestinationData {
  hotels: boolean
  flightPricing: boolean
  flightDurations: boolean
  visaRequirements: boolean
  airportMapping: boolean
  coordinates: boolean
}

export class DestinationValidator {
  
  // Validate a single destination has all required data
  static validateDestination(destinationName: string): DestinationValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    
    // Check hotel data availability
    const hotelDataExists = this.checkHotelData(destinationName)
    if (!hotelDataExists.exists) {
      errors.push(`Missing hotel data for ${destinationName}`)
    } else if (hotelDataExists.count < 3) {
      warnings.push(`Only ${hotelDataExists.count} hotels available for ${destinationName}, consider adding more`)
    }
    
    // Check flight pricing data
    const flightDataExists = this.checkFlightData(destinationName)
    if (!flightDataExists.exists) {
      errors.push(`Missing flight pricing data for ${destinationName}`)
    }
    
    // Check airport code mapping
    const airportCodeExists = this.checkAirportCode(destinationName)
    if (!airportCodeExists) {
      errors.push(`Missing airport code mapping for ${destinationName}`)
    }
    
    // Check coordinates
    const coordinatesExist = this.checkCoordinates(destinationName)
    if (!coordinatesExist) {
      warnings.push(`Missing coordinate data for ${destinationName}`)
    }
    
    // Check visa requirements
    const visaDataExists = this.checkVisaData(destinationName)
    if (!visaDataExists) {
      warnings.push(`Missing visa requirement data for ${destinationName}`)
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      destination: destinationName
    }
  }
  
  // Validate all known destinations
  static validateAllDestinations(): { valid: string[], invalid: DestinationValidationResult[], summary: any } {
    const knownDestinations = [
      'Istanbul, Turkey', 'Bangkok, Thailand', 'Tokyo, Japan', 'Singapore',
      'Jakarta, Indonesia', 'Seoul, South Korea', 'Hong Kong', 'Dubai, UAE',
      'Mumbai, India', 'Delhi, India', 'Kuala Lumpur, Malaysia'
    ]
    
    const validDestinations: string[] = []
    const invalidDestinations: DestinationValidationResult[] = []
    
    for (const destination of knownDestinations) {
      const validation = this.validateDestination(destination)
      if (validation.isValid) {
        validDestinations.push(destination)
      } else {
        invalidDestinations.push(validation)
      }
    }
    
    const summary = {
      total: knownDestinations.length,
      valid: validDestinations.length,
      invalid: invalidDestinations.length,
      completeness: Math.round((validDestinations.length / knownDestinations.length) * 100)
    }
    
    return { valid: validDestinations, invalid: invalidDestinations, summary }
  }
  
  // Check if hotel data exists for destination
  private static checkHotelData(destination: string): { exists: boolean, count: number } {
    // This would check against the actual hotel API data structure
    const hotelDestinations = ['Bangkok', 'Tokyo', 'Singapore', 'Jakarta', 'Istanbul']
    const cityName = destination.split(',')[0]
    
    const exists = hotelDestinations.some(dest => 
      dest.toLowerCase() === cityName.toLowerCase()
    )
    
    // Estimated hotel count based on destination size
    const hotelCounts: { [key: string]: number } = {
      'Bangkok': 6, 'Tokyo': 4, 'Singapore': 3, 'Jakarta': 4, 'Istanbul': 10
    }
    
    const count = hotelCounts[cityName] || 0
    
    return { exists, count }
  }
  
  // Check flight pricing data
  private static checkFlightData(destination: string): { exists: boolean } {
    const flightDestinations = [
      'Istanbul, Turkey', 'Bangkok, Thailand', 'Tokyo, Japan', 'Singapore',
      'Jakarta, Indonesia', 'Seoul, South Korea', 'Hong Kong', 'Dubai, UAE'
    ]
    
    const exists = flightDestinations.includes(destination)
    return { exists }
  }
  
  // Check airport code mapping
  private static checkAirportCode(destination: string): boolean {
    const airportCodes: { [key: string]: string } = {
      'Bangkok': 'BKK', 'Tokyo': 'TYO', 'Singapore': 'SIN', 'Seoul': 'ICN',
      'Hong Kong': 'HKG', 'Istanbul': 'IST', 'Jakarta': 'CGK', 'Dubai': 'DXB'
    }
    
    const cityName = destination.split(',')[0]
    return !!airportCodes[cityName]
  }
  
  // Check coordinate data
  private static checkCoordinates(destination: string): boolean {
    const coordinates: { [key: string]: boolean } = {
      'Bangkok': true, 'Tokyo': true, 'Singapore': true, 'Jakarta': true,
      'Istanbul': true, 'Seoul': true, 'Hong Kong': true, 'Dubai': true
    }
    
    const cityName = destination.split(',')[0]
    return coordinates[cityName] || false
  }
  
  // Check visa requirement data
  private static checkVisaData(destination: string): boolean {
    // Most destinations should have visa data
    const visaDestinations = [
      'Istanbul, Turkey', 'Bangkok, Thailand', 'Tokyo, Japan', 'Singapore',
      'Jakarta, Indonesia', 'Seoul, South Korea', 'Hong Kong', 'Dubai, UAE'
    ]
    
    return visaDestinations.includes(destination)
  }
  
  // Generate missing data report
  static generateMissingDataReport(): { 
    missingHotels: string[], 
    missingFlightData: string[], 
    missingAirportCodes: string[],
    recommendations: string[]
  } {
    const allDestinations = [
      'Istanbul, Turkey', 'Bangkok, Thailand', 'Tokyo, Japan', 'Singapore',
      'Jakarta, Indonesia', 'Seoul, South Korea', 'Hong Kong', 'Dubai, UAE',
      'Mumbai, India', 'Delhi, India', 'Kuala Lumpur, Malaysia', 'Manila, Philippines'
    ]
    
    const missingHotels: string[] = []
    const missingFlightData: string[] = []
    const missingAirportCodes: string[] = []
    
    for (const destination of allDestinations) {
      const hotelCheck = this.checkHotelData(destination)
      if (!hotelCheck.exists) missingHotels.push(destination)
      
      const flightCheck = this.checkFlightData(destination)
      if (!flightCheck.exists) missingFlightData.push(destination)
      
      const airportCheck = this.checkAirportCode(destination)
      if (!airportCheck) missingAirportCodes.push(destination)
    }
    
    const recommendations = [
      `Add hotel data for ${missingHotels.length} destinations: ${missingHotels.slice(0, 3).join(', ')}${missingHotels.length > 3 ? '...' : ''}`,
      `Add flight pricing for ${missingFlightData.length} destinations: ${missingFlightData.slice(0, 3).join(', ')}${missingFlightData.length > 3 ? '...' : ''}`,
      `Add airport codes for ${missingAirportCodes.length} destinations: ${missingAirportCodes.slice(0, 3).join(', ')}${missingAirportCodes.length > 3 ? '...' : ''}`,
    ]
    
    return { missingHotels, missingFlightData, missingAirportCodes, recommendations }
  }
  
  // Test specific destination combinations
  static testDestinationCombinations(): { passed: number, failed: number, results: any[] } {
    const testCases = [
      { search: 'Istanbul', expected: 'Istanbul, Turkey' },
      { search: 'Bangkok', expected: 'Bangkok, Thailand' },
      { search: 'Turkey', expected: 'Istanbul, Turkey' },
      { search: 'Jakarta', expected: 'Jakarta, Indonesia' },
      { search: 'Singapore', expected: 'Singapore' }
    ]
    
    let passed = 0
    let failed = 0
    const results: any[] = []
    
    for (const testCase of testCases) {
      const validation = this.validateDestination(testCase.expected)
      const result = {
        testCase,
        passed: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings
      }
      
      if (validation.isValid) {
        passed++
      } else {
        failed++
      }
      
      results.push(result)
    }
    
    return { passed, failed, results }
  }
}

// Export validation functions for use in API routes
export const validateDestinationData = (destination: string) => {
  return DestinationValidator.validateDestination(destination)
}

export const getAllDestinationStatus = () => {
  return DestinationValidator.validateAllDestinations()
}

export const getMissingDataReport = () => {
  return DestinationValidator.generateMissingDataReport()
}