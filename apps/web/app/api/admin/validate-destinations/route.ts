import { NextRequest, NextResponse } from 'next/server'
import { DestinationValidator, getAllDestinationStatus, getMissingDataReport } from '../../../../lib/destination-validator'

// GET /api/admin/validate-destinations - Comprehensive destination data validation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'all'
    const destination = searchParams.get('destination')
    
    switch (action) {
      case 'single':
        if (!destination) {
          return NextResponse.json(
            { error: 'Destination parameter required for single validation' },
            { status: 400 }
          )
        }
        
        const singleValidation = DestinationValidator.validateDestination(destination)
        return NextResponse.json({
          success: true,
          action: 'single',
          destination,
          validation: singleValidation,
          timestamp: new Date().toISOString()
        })
        
      case 'missing':
        const missingReport = getMissingDataReport()
        return NextResponse.json({
          success: true,
          action: 'missing',
          report: missingReport,
          timestamp: new Date().toISOString()
        })
        
      case 'test':
        const testResults = DestinationValidator.testDestinationCombinations()
        return NextResponse.json({
          success: true,
          action: 'test',
          results: testResults,
          timestamp: new Date().toISOString()
        })
        
      case 'all':
      default:
        const allValidation = getAllDestinationStatus()
        
        // Detailed analysis
        const analysis = {
          overview: {
            total_destinations: allValidation.summary.total,
            valid_destinations: allValidation.summary.valid,
            invalid_destinations: allValidation.summary.invalid,
            completeness_percentage: allValidation.summary.completeness
          },
          status: allValidation.summary.completeness >= 80 ? 'GOOD' : 
                 allValidation.summary.completeness >= 60 ? 'NEEDS_IMPROVEMENT' : 'CRITICAL',
          valid_destinations: allValidation.valid,
          issues: allValidation.invalid.map(invalid => ({
            destination: invalid.destination,
            error_count: invalid.errors.length,
            warning_count: invalid.warnings.length,
            errors: invalid.errors,
            warnings: invalid.warnings
          })),
          recommendations: generateRecommendations(allValidation.invalid)
        }
        
        return NextResponse.json({
          success: true,
          action: 'all',
          analysis,
          timestamp: new Date().toISOString()
        })
    }
    
  } catch (error) {
    console.error('Destination validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate destinations' },
      { status: 500 }
    )
  }
}

// POST /api/admin/validate-destinations - Run specific validation tests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { destinations, tests } = body
    
    if (!destinations || !Array.isArray(destinations)) {
      return NextResponse.json(
        { error: 'destinations array is required' },
        { status: 400 }
      )
    }
    
    const results = []
    
    for (const destination of destinations) {
      const validation = DestinationValidator.validateDestination(destination)
      
      // Run specific tests if requested
      const testResults: any = {
        destination,
        validation,
        tests: {}
      }
      
      if (tests?.includes('hotel_search')) {
        testResults.tests.hotel_search = await testHotelSearch(destination)
      }
      
      if (tests?.includes('flight_pricing')) {
        testResults.tests.flight_pricing = await testFlightPricing(destination)
      }
      
      if (tests?.includes('location_matching')) {
        testResults.tests.location_matching = testLocationMatching(destination)
      }
      
      results.push(testResults)
    }
    
    const summary = {
      total_tested: destinations.length,
      passed: results.filter(r => r.validation.isValid).length,
      failed: results.filter(r => !r.validation.isValid).length,
      overall_health: calculateOverallHealth(results)
    }
    
    return NextResponse.json({
      success: true,
      summary,
      results,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Validation test error:', error)
    return NextResponse.json(
      { error: 'Failed to run validation tests' },
      { status: 500 }
    )
  }
}

// Helper functions

function generateRecommendations(invalidDestinations: any[]): string[] {
  const recommendations = []
  
  const commonErrors = invalidDestinations.flatMap(dest => dest.errors)
  const hotelErrors = commonErrors.filter(error => error.includes('hotel'))
  const flightErrors = commonErrors.filter(error => error.includes('flight'))
  const airportErrors = commonErrors.filter(error => error.includes('airport'))
  
  if (hotelErrors.length > 0) {
    recommendations.push(`Priority: Add hotel data for ${hotelErrors.length} destinations to prevent Bangkok fallback`)
  }
  
  if (flightErrors.length > 0) {
    recommendations.push(`Add flight pricing data for ${flightErrors.length} destinations`)
  }
  
  if (airportErrors.length > 0) {
    recommendations.push(`Add airport code mappings for ${airportErrors.length} destinations`)
  }
  
  recommendations.push('Consider adding automated tests to catch missing data before deployment')
  
  return recommendations
}

async function testHotelSearch(destination: string): Promise<{ success: boolean, details: any }> {
  try {
    const cityName = destination.split(',')[0]
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/hotels/search?destination=${cityName}&check_in=2024-06-01&check_out=2024-06-03&adults=2`)
    
    if (response.ok) {
      const data = await response.json()
      const isLocationCorrect = data.success && 
        data.data?.hotels?.length > 0 && 
        data.data.hotels[0].location?.city?.toLowerCase().includes(cityName.toLowerCase())
      
      return {
        success: isLocationCorrect,
        details: {
          api_success: data.success,
          hotel_count: data.data?.hotels?.length || 0,
          location_match: isLocationCorrect,
          first_hotel: data.data?.hotels?.[0]?.name || null
        }
      }
    }
    
    return { success: false, details: { error: 'API request failed' } }
  } catch (error) {
    return { success: false, details: { error: error.message } }
  }
}

async function testFlightPricing(destination: string): Promise<{ success: boolean, details: any }> {
  try {
    // This would test the flight pricing API
    // For now, just check if destination has known pricing
    const hasFlightData = ['Istanbul, Turkey', 'Bangkok, Thailand', 'Tokyo, Japan'].includes(destination)
    
    return {
      success: hasFlightData,
      details: {
        has_pricing_data: hasFlightData,
        estimated_price: hasFlightData ? 'Available' : 'Missing'
      }
    }
  } catch (error) {
    return { success: false, details: { error: error.message } }
  }
}

function testLocationMatching(destination: string): { success: boolean, details: any } {
  const cityName = destination.split(',')[0].toLowerCase()
  const country = destination.split(',')[1]?.trim().toLowerCase()
  
  // Test common location mix-ups
  const locationMixups = {
    'istanbul': 'turkey',
    'bangkok': 'thailand', 
    'jakarta': 'indonesia'
  }
  
  const expectedCountry = locationMixups[cityName]
  const countryMatches = !expectedCountry || (country && country.includes(expectedCountry))
  
  return {
    success: countryMatches,
    details: {
      city: cityName,
      expected_country: expectedCountry,
      actual_country: country,
      matches: countryMatches
    }
  }
}

function calculateOverallHealth(results: any[]): string {
  const totalScore = results.reduce((sum, result) => {
    let score = result.validation.isValid ? 100 : 0
    
    // Deduct points for warnings
    score -= result.validation.warnings.length * 5
    
    // Add points for passing tests
    if (result.tests) {
      const testsPassed = Object.values(result.tests).filter((test: any) => test.success).length
      const totalTests = Object.keys(result.tests).length
      if (totalTests > 0) {
        score += (testsPassed / totalTests) * 20
      }
    }
    
    return sum + Math.max(0, Math.min(100, score))
  }, 0)
  
  const averageScore = totalScore / results.length
  
  if (averageScore >= 90) return 'EXCELLENT'
  if (averageScore >= 75) return 'GOOD'
  if (averageScore >= 60) return 'FAIR'
  if (averageScore >= 40) return 'POOR'
  return 'CRITICAL'
}