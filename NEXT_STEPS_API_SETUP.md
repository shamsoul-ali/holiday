# Priority API Setup Guide

Your Holiday AI platform is now operational with **OpenAI** and **Amadeus** APIs! 

## Current Status ✅
- **OpenAI**: Configured and validated (AI-powered itinerary generation)
- **Amadeus**: Configured and validated (Flight and hotel search)
- **OpenWeather**: API key provided but needs verification/activation
- **System Health**: Operational with 2/16 APIs active (12.5% health score)

## Next Priority APIs to Configure

### 1. OpenWeather API (FREE - 1,000 calls/day) ❌ 
**Purpose**: Real-time weather data for destination recommendations
**Status**: Two API keys provided (`87fe8c...`, `1d1d28...`) - both returning "Invalid API key" error
**Issue**: Keys may need account verification or activation
**Next Steps**: 
1. Visit: https://openweathermap.org/home/sign_up
2. Create account and verify email address
3. Generate API key from dashboard: https://home.openweathermap.org/api_keys
4. Wait 10-15 minutes for activation
5. Replace key in system: `OPENWEATHER_API_KEY=your_working_key`
6. Restart: `docker-compose restart api`

**Impact**: Weather-based travel recommendations, seasonal planning

### 2. Google Places API ($200 monthly free credit)
**Purpose**: Activities, restaurants, attractions discovery
**Setup**:
1. Visit: https://console.cloud.google.com/
2. Enable Places API
3. Create credentials
4. Update `.env`: `GOOGLE_PLACES_API_KEY=your_actual_key`

**Impact**: Detailed activity recommendations, restaurant suggestions

### 3. Stripe API (No monthly fees, per-transaction)
**Purpose**: Payment processing for bookings
**Setup**:
1. Visit: https://dashboard.stripe.com/register
2. Get test keys for development
3. Update `.env`: 
   - `STRIPE_PUBLISHABLE_KEY=pk_test_...`
   - `STRIPE_SECRET_KEY=sk_test_...`

**Impact**: Enable actual booking and payment processing

## Quick Setup Commands

After obtaining API keys, restart the service:
```bash
docker-compose restart api
# Wait 30 seconds, then test:
curl "http://localhost:8000/api/system/health"
```

## Current Capabilities
✅ AI-powered itinerary generation  
✅ Real flight search (Amadeus)  
✅ Hotel availability checking  
🔄 Weather-based recommendations (needs OpenWeather)  
🔄 Activity discovery (needs Google Places)  
🔄 Payment processing (needs Stripe)  

## Test Your Setup
```bash
# Test travel recommendations
curl "http://localhost:8000/api/top10?budget=5000&currency=MYR&pax=2"

# Check API status
curl "http://localhost:8000/api/system/api-keys/status"
```

Your platform is production-ready for AI-powered travel recommendations with real flight data!