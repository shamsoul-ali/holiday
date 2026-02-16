import { NextRequest, NextResponse } from 'next/server'
import { enhancedRapidAPI } from '../../../../lib/enhanced-rapidapi-service'

export async function GET(request: NextRequest) {
  try {
    console.log('RapidAPI Health: Running comprehensive API health check')

    const healthResponse = await enhancedRapidAPI.checkAPIHealth()

    if (!healthResponse.success) {
      return NextResponse.json({
        success: false,
        error: healthResponse.error || 'Health check failed'
      }, { status: 500 })
    }

    const healthData = healthResponse.data

    // Add overall system status
    const overallStatus = healthData.healthy_count === healthData.total_count 
      ? 'all_systems_operational'
      : healthData.healthy_count > 0 
      ? 'partial_outage' 
      : 'major_outage'

    const enhancedHealthData = {
      ...healthData,
      overall_status: overallStatus,
      uptime_percentage: Math.round((healthData.healthy_count / healthData.total_count) * 100),
      status_message: getStatusMessage(overallStatus, healthData.healthy_count, healthData.total_count),
      recommendations: getHealthRecommendations(healthData.apis)
    }

    console.log(`RapidAPI Health: ${healthData.overall_health}`)

    return NextResponse.json({
      success: true,
      data: enhancedHealthData,
      source: 'RapidAPI Health Monitor'
    })

  } catch (error) {
    console.error('RapidAPI Health check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Health check service unavailable',
      data: {
        overall_status: 'health_check_failed',
        healthy_count: 0,
        total_count: 0,
        apis: [],
        checked_at: new Date().toISOString(),
        error_details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 })
  }
}

function getStatusMessage(status: string, healthy: number, total: number): string {
  switch (status) {
    case 'all_systems_operational':
      return `All ${total} RapidAPI services are operational`
    case 'partial_outage':
      return `${healthy} of ${total} RapidAPI services are operational`
    case 'major_outage':
      return `All RapidAPI services are currently experiencing issues`
    default:
      return 'System status unknown'
  }
}

function getHealthRecommendations(apis: any[]): string[] {
  const recommendations = []
  
  const unhealthyApis = apis.filter(api => api.status !== 'healthy')
  const slowApis = apis.filter(api => api.response_time > 5000)
  
  if (unhealthyApis.length > 0) {
    recommendations.push(`${unhealthyApis.length} API(s) need attention: ${unhealthyApis.map(api => api.name).join(', ')}`)
  }
  
  if (slowApis.length > 0) {
    recommendations.push(`${slowApis.length} API(s) experiencing slow responses: ${slowApis.map(api => api.name).join(', ')}`)
  }
  
  if (apis.length > 0 && unhealthyApis.length === 0) {
    recommendations.push('All APIs are performing well')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('System monitoring active - check back regularly')
  }
  
  return recommendations
}