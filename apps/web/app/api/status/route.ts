import { NextResponse } from 'next/server';
import { testAPIConnections } from '../../../lib/api-config';

export async function GET() {
  try {
    const connectionResults = await testAPIConnections();
    
    const overallStatus = Object.values(connectionResults).every(status => status);
    
    return NextResponse.json({
      success: true,
      overall: overallStatus ? 'healthy' : 'degraded',
      services: {
        openai: {
          status: connectionResults.openai ? 'connected' : 'disconnected',
          description: 'AI Travel Itinerary Generation'
        },
        amadeus: {
          status: connectionResults.amadeus ? 'connected' : 'disconnected',
          description: 'Flight & Hotel Booking Data'
        },
        openweather: {
          status: connectionResults.openweather ? 'connected' : 'disconnected',
          description: 'Weather Information'
        },
        backend: {
          status: connectionResults.backend ? 'connected' : 'disconnected',
          description: 'Holiday AI Backend Services'
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        overall: 'error',
        error: 'Unable to check service status',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}