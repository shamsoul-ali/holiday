import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

/**
 * System Health API - Proxies to FastAPI Backend
 * Returns API health status and configuration
 */
export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/system/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Don't cache health checks
      cache: 'no-store'
    })

    if (!response.ok) {
      console.error('Backend health check failed:', response.status)
      return NextResponse.json(
        {
          error: 'Health check failed',
          status: 'degraded',
          health_score: 0
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    })
  } catch (error) {
    console.error('System health API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch system health',
        status: 'error',
        health_score: 0,
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
