import { NextRequest, NextResponse } from 'next/server';
import { apiHelpers } from '../../../lib/api-config';

export async function POST(request: NextRequest) {
  try {
    const { service } = await request.json();
    
    let result = { success: false, data: null, error: null };

    switch (service) {
      case 'openai':
        try {
          const aiTest = await apiHelpers.generateItinerary({
            destination: 'Tokyo, Japan',
            budget: 5000,
            preferences: ['city', 'food']
          });
          result = {
            success: !!aiTest,
            data: aiTest ? 'AI service responding correctly' : null,
            error: aiTest ? null : 'AI service not responding'
          };
        } catch (error) {
          result.error = `OpenAI error: ${error}`;
        }
        break;

      case 'amadeus':
        try {
          const flightTest = await apiHelpers.searchFlights('KUL', 'NRT', '2024-12-01');
          result = {
            success: !!flightTest,
            data: flightTest ? `Found ${flightTest.data?.length || 0} flight options` : null,
            error: flightTest ? null : 'Amadeus API not responding'
          };
        } catch (error) {
          result.error = `Amadeus error: ${error}`;
        }
        break;

      case 'weather':
        try {
          const weatherTest = await apiHelpers.getCurrentWeather('Tokyo');
          result = {
            success: !!weatherTest,
            data: weatherTest ? `Tokyo weather: ${weatherTest.main?.temp}°C, ${weatherTest.weather?.[0]?.description}` : null,
            error: weatherTest ? null : 'OpenWeather API not responding'
          };
        } catch (error) {
          result.error = `Weather API error: ${error}`;
        }
        break;

      case 'backend':
        try {
          const backendTest = await apiHelpers.callBackendAPI('/health');
          result = {
            success: !!backendTest,
            data: backendTest ? 'Backend API healthy' : null,
            error: backendTest ? null : 'Backend API not responding'
          };
        } catch (error) {
          result.error = `Backend error: ${error}`;
        }
        break;

      default:
        result.error = 'Unknown service requested';
    }

    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        data: null,
        error: `Test API error: ${error}` 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Test all services at once
  const results = await Promise.all([
    testService('openai'),
    testService('amadeus'), 
    testService('weather'),
    testService('backend')
  ]);

  const [openaiResult, amadeusResult, weatherResult, backendResult] = results;

  return NextResponse.json({
    success: true,
    services: {
      openai: openaiResult,
      amadeus: amadeusResult,
      weather: weatherResult,
      backend: backendResult
    },
    timestamp: new Date().toISOString()
  });
}

async function testService(service: string) {
  try {
    let result = { success: false, data: null, error: null };

    switch (service) {
      case 'openai':
        const aiTest = await apiHelpers.generateItinerary({
          destination: 'Tokyo, Japan',
          budget: 5000,
          preferences: ['city', 'food']
        });
        result = {
          success: !!aiTest,
          data: aiTest ? 'AI service operational' : null,
          error: aiTest ? null : 'AI service unavailable'
        };
        break;

      case 'amadeus':
        const flightTest = await apiHelpers.searchFlights('KUL', 'NRT', '2024-12-01');
        result = {
          success: !!flightTest,
          data: flightTest ? 'Flight API operational' : null,
          error: flightTest ? null : 'Flight API unavailable'
        };
        break;

      case 'weather':
        const weatherTest = await apiHelpers.getCurrentWeather('Tokyo');
        result = {
          success: !!weatherTest,
          data: weatherTest ? 'Weather API operational' : null,
          error: weatherTest ? null : 'Weather API unavailable'
        };
        break;

      case 'backend':
        const backendTest = await apiHelpers.callBackendAPI('/health');
        result = {
          success: !!backendTest,
          data: backendTest ? 'Backend operational' : null,
          error: backendTest ? null : 'Backend unavailable'
        };
        break;
    }

    return result;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: `${service} test failed: ${error}`
    };
  }
}