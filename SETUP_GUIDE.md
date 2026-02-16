# Holiday AI Platform - Setup Guide 🚀

## Overview

Your Holiday AI platform has been enhanced with production-ready optimizations. This guide will help you configure API keys and activate all features.

## ✅ Current Status

**Platform Status**: Fully Functional with Mock Data
**API Integration**: Ready for Real API Keys  
**Payment System**: Configured for Stripe & iPay88  
**Caching**: Redis-powered performance optimization  
**AI System**: Ready for OpenAI/Claude integration  

## 🔧 Quick Setup (Production Ready)

### 1. API Key Configuration

The platform supports 25+ travel APIs. Add your keys to `.env` file:

```bash
# Get your API key template
curl "http://localhost:8000/api/system/env-template"

# Copy env.example to .env and configure:
cp env.example .env
```

**Priority API Keys** (Start with these):
```bash
# AI Services (Choose one)
OPENAI_API_KEY=sk-your_openai_key_here
# OR
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here

# Flight Search (Choose one)
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
# OR  
KIWI_API_KEY=your_kiwi_api_key

# Weather Data
OPENWEATHER_API_KEY=your_openweather_key_here

# Google Services
GOOGLE_PLACES_API_KEY=your_google_places_key_here

# Payment Processing (Choose based on market)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 2. Check System Health

```bash
# Check overall system health
curl "http://localhost:8000/api/system/health"

# Check API key validation
curl "http://localhost:8000/api/system/api-keys/status"

# Check cache system
curl "http://localhost:8000/api/cache/health"
```

### 3. Test Core Features

```bash
# Test destination recommendations (cached)
curl "http://localhost:8000/api/top10?budget=5000&currency=MYR&pax=2&halal=true"

# Test payment methods
curl "http://localhost:8000/api/payments/methods?country_code=MY"

# Check cache statistics  
curl "http://localhost:8000/api/cache/stats"
```

## 🌟 New Features Implemented

### 1. **Intelligent API Key Management**
- **Auto-validation** of all 25+ API keys on startup
- **Health monitoring** with detailed status reports
- **Fallback strategies** when APIs are unavailable
- **Environment template** generation for easy setup

**Endpoints:**
- `/api/system/health` - Complete system health check
- `/api/system/api-keys/status` - API key validation status
- `/api/system/env-template` - Generate .env template

### 2. **Real AI Integration**
- **OpenAI GPT-4 Turbo** primary integration
- **Anthropic Claude-3** as intelligent fallback
- **Structured JSON responses** for itinerary generation
- **Content-aware caching** for AI responses

**Features:**
- Personalized itinerary generation
- Local insights and cultural tips  
- Budget-optimized recommendations
- Halal/family-friendly filtering

### 3. **Live Weather & Events Data**
- **OpenWeather API** for current conditions
- **Open-Meteo** for forecasts (free tier)
- **Ticketmaster Events** integration
- **Seasonal event detection**

**Capabilities:**
- Weather comfort index calculation
- Real-time event discovery
- Seasonal travel optimization
- Climate-aware recommendations

### 4. **Production Payment System**
- **Stripe** for international payments
- **iPay88** for Malaysian market
- **Webhook handling** for payment confirmations
- **Refund processing** automation

**Endpoints:**
- `/api/payments/create-intent` - Create payment
- `/api/payments/verify` - Verify payment status
- `/api/payments/stripe/webhook` - Stripe webhooks
- `/api/payments/ipay88/callback` - iPay88 callbacks

### 5. **Redis-Powered Caching**
- **Intelligent TTL strategies** by data type
- **Content-based invalidation** for AI responses
- **Performance monitoring** with hit rates
- **Cache warming** for popular destinations

**Cache Types:**
- `flights` - 5min TTL (real-time pricing)
- `hotels` - 30min TTL (availability)
- `activities` - 1hr TTL (stable data)
- `ai_itineraries` - 24hr TTL (content-based)
- `weather` - 30min TTL (changing conditions)

## 🎯 API Provider Recommendations

### **Flight Search** (Choose based on coverage)
1. **Amadeus** - Best global coverage, official airline APIs
2. **Kiwi/Tequila** - Great for budget options, flexible routing
3. **Skyscanner** - Price comparison, redirect model
4. **Duffel** - Modern API, growing inventory

### **Hotel Search**
1. **Amadeus Hotel** - Direct hotel connections
2. **Expedia Rapid** - Extensive inventory, good rates

### **Activities & Experiences**
1. **GetYourGuide** - Europe & global attractions
2. **Viator** - North America focused, TripAdvisor owned
3. **Klook** - Asia-Pacific specialist

### **AI Services**
1. **OpenAI GPT-4 Turbo** - Best for creative itineraries
2. **Anthropic Claude-3** - Excellent for cultural insights

## 📊 Performance Optimizations Active

### **Caching Strategy**
- **Flight prices**: 5-minute cache (real-time pricing)
- **Hotel rates**: 30-minute cache (availability changes)
- **AI itineraries**: 24-hour cache (stable for same input)
- **Weather data**: 30-minute cache (regular updates)
- **Activities**: 1-hour cache (stable venue data)

### **API Optimization**
- **Intelligent provider selection** by region and budget
- **Automatic failover** between API providers
- **Rate limiting protection** with exponential backoff
- **Response compression** for large datasets

### **Database Performance**
- **PostgreSQL with pgvector** for AI embeddings
- **Redis caching layer** for frequently accessed data
- **Connection pooling** for optimal resource usage

## 🔍 Monitoring & Debugging

### **System Health Monitoring**
```bash
# Overall system status
GET /api/system/health

# API key validation results
GET /api/system/api-keys/status  

# Cache performance metrics
GET /api/cache/stats

# Payment system status
GET /api/payments/health
```

### **Cache Management**
```bash
# View cache statistics
GET /api/cache/stats

# Warm cache for popular routes
POST /api/cache/warm

# Clear specific cache types
DELETE /api/cache/flush/{cache_type}

# Cache optimization suggestions
POST /api/cache/optimize
```

## 🚦 Production Deployment Checklist

### **Required API Keys** (Must have):
- [ ] OpenAI or Anthropic (AI generation)
- [ ] Amadeus or Kiwi (Flight search)  
- [ ] OpenWeather (Weather data)
- [ ] Google Places (Activities)
- [ ] Stripe (Payments)

### **Recommended API Keys**:
- [ ] Expedia Rapid (Hotels)
- [ ] GetYourGuide (Activities)
- [ ] Viator (Experiences)
- [ ] Ticketmaster (Events)

### **Infrastructure**:
- [ ] Redis server running
- [ ] PostgreSQL with pgvector
- [ ] Environment variables configured
- [ ] Docker containers healthy
- [ ] SSL certificates (production)

### **Validation Steps**:
```bash
# 1. Check all systems
curl "http://localhost:8000/api/system/health"

# 2. Validate API keys
curl "http://localhost:8000/api/system/api-keys/validate"

# 3. Test core functionality
curl "http://localhost:8000/api/top10?budget=5000&currency=MYR&pax=2"

# 4. Verify caching
curl "http://localhost:8000/api/cache/health"

# 5. Check payment methods
curl "http://localhost:8000/api/payments/methods"
```

## 🎊 Ready for Production!

Your Holiday AI platform now has:

✅ **Enterprise-grade API management**  
✅ **Real AI-powered recommendations**  
✅ **Live weather & events integration**  
✅ **Production payment processing**  
✅ **Redis-powered performance caching**  
✅ **Comprehensive health monitoring**  
✅ **Intelligent provider selection**  

**Next Steps:**
1. Add your API keys to `.env` file
2. Restart the API service: `docker-compose restart api`
3. Test the enhanced endpoints
4. Monitor performance via `/api/cache/stats`
5. Set up payment webhooks for your domain

Your platform is now ready to compete with major OTAs! 🚀