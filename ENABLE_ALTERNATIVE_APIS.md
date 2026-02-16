# Enable Alternative Travel APIs

Your platform supports **9 travel API clients** with automatic fallback. When one API fails, others take over automatically.

## 🚀 Quick Setup Guide

### 1️⃣ Kiwi/Tequila API (Best Alternative - FREE TIER!)

**Best for:** Budget flights, multi-city routes, flexible dates

**Sign up:** https://tequila.kiwi.com/portal/login

**Steps:**
```bash
# 1. Sign up at tequila.kiwi.com
# 2. Get your API key from dashboard
# 3. Add to docker-compose.yml:

environment:
  - "KIWI_TEQUILA_KEY=your_api_key_here"
```

**Free Tier:** 2,000 requests/month

---

### 2️⃣ Skyscanner API

**Best for:** Price comparison, budget carriers

**Sign up:** https://rapidapi.com/skyscanner/api/skyscanner-flight-search

**Steps:**
```bash
# Add to docker-compose.yml:
environment:
  - "SKYSCANNER_API_KEY=your_rapidapi_key"
```

**Pricing:** RapidAPI free tier available

---

### 3️⃣ Google Places API

**Best for:** Hotels, restaurants, POI, reviews

**Sign up:** https://console.cloud.google.com/

**Steps:**
```bash
# 1. Enable Google Places API in Google Cloud Console
# 2. Create API key with Places API enabled
# 3. Add to docker-compose.yml:

environment:
  - "GOOGLE_PLACES_API_KEY=your_api_key_here"
```

**Pricing:** $200 free credit/month

---

### 4️⃣ Expedia Rapid API

**Best for:** Hotels, vacation packages

**Sign up:** https://developers.expediagroup.com/

**Steps:**
```bash
# Add to docker-compose.yml:
environment:
  - "EXPEDIA_RAPID_API_KEY=your_api_key_here"
```

---

### 5️⃣ TripAdvisor API

**Best for:** Reviews, ratings, restaurant recommendations

**Sign up:** https://www.tripadvisor.com/developers

**Steps:**
```bash
# Add to docker-compose.yml:
environment:
  - "TRIPADVISOR_API_KEY=your_api_key_here"
```

---

## 📝 How to Add API Keys

### Option A: Edit docker-compose.yml (Current Setup)

```yaml
api:
  environment:
    # Existing keys...
    - "AMADEUS_CLIENT_ID=tGuPOqbis3dXptU2ntNSf1p2AwIJavEj"

    # Add new keys here:
    - "KIWI_TEQUILA_KEY=your_kiwi_key"
    - "SKYSCANNER_API_KEY=your_skyscanner_key"
    - "GOOGLE_PLACES_API_KEY=your_google_key"
    - "EXPEDIA_RAPID_API_KEY=your_expedia_key"
    - "TRIPADVISOR_API_KEY=your_tripadvisor_key"
```

### Option B: Use .env file (Recommended for Production)

```bash
# 1. Create .env file
cat > .env << 'EOF'
# Travel APIs
KIWI_TEQUILA_KEY=your_key_here
SKYSCANNER_API_KEY=your_key_here
GOOGLE_PLACES_API_KEY=your_key_here
EXPEDIA_RAPID_API_KEY=your_key_here
TRIPADVISOR_API_KEY=your_key_here
EOF

# 2. Update docker-compose.yml
api:
  env_file:
    - .env

# 3. Add to .gitignore
echo ".env" >> .gitignore
```

---

## ✅ Verify API Configuration

After adding keys, restart and check:

```bash
# Restart services
docker-compose restart api

# Check API validation
curl http://localhost:8000/api/system/health

# Test AI generation
curl -X POST http://localhost:3010/api/planning/create \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "KUL",
    "destination": "Tokyo",
    "start_date": "2026-03-15",
    "end_date": "2026-03-22",
    "passengers": 2,
    "budget_per_person": 4000,
    "travel_style": "comfort",
    "preferences": {"halal_friendly": true}
  }'
```

---

## 🎯 Recommended Priority

For best results, enable in this order:

| Priority | API | Why |
|----------|-----|-----|
| 1 | **Kiwi/Tequila** | Free tier, great flight data |
| 2 | **Google Places** | $200/month free credit, hotels & POI |
| 3 | **Skyscanner** | Budget carrier coverage |
| 4 | **Expedia** | Hotel variety |
| 5 | **TripAdvisor** | Reviews & ratings |

---

## 🔄 How Fallback Works

Your AI orchestrator automatically searches multiple APIs:

```python
# From ai_orchestrator.py:189
async def _search_flights():
    flight_offers = []

    # Try Amadeus first
    if amadeus_client.client_id:
        amadeus_flights = await amadeus_client.search_flights(...)
        flight_offers.extend(amadeus_flights)

    # Try Kiwi (if key exists)
    if kiwi_client.api_key:
        kiwi_flights = await kiwi_client.search_flights(...)
        flight_offers.extend(kiwi_flights)

    # Try Skyscanner (if key exists)
    if skyscanner_client.api_key:
        skyscanner_flights = await skyscanner_client.search_flights(...)
        flight_offers.extend(skyscanner_flights)

    # ... more providers

    return flight_offers  # Combined results from all providers!
```

**Result:** More flight options, better prices, automatic redundancy!

---

## 🐛 Current Issues & Status

### ✅ Working APIs:
- Amadeus Flights (with 30s timeout fix)
- OpenWeather
- Open-Meteo weather

### ⚠️ Issues:
- Amadeus Hotels (404 - endpoint not available in test environment)
- AI response schema validation (being worked on)

### 🔧 Quick Fix:
Enable **Kiwi** and **Google Places** to get:
- ✅ More flight options
- ✅ Hotel search working (via Google Places)
- ✅ POI and activities data

---

## 💡 Pro Tips

1. **Start with Kiwi** - Free tier is generous and API is reliable
2. **Google Places is powerful** - Hotels, restaurants, reviews all in one
3. **Monitor usage** - Check API quotas in respective dashboards
4. **Test one at a time** - Add keys incrementally to verify each works

---

## 📞 Support

- **Kiwi Issues:** https://tequila.kiwi.com/portal/support
- **Google Issues:** https://support.google.com/googleapi
- **Platform Issues:** Check `/api/system/health` endpoint

---

**Generated:** 2026-02-16
**Last Updated:** 2026-02-16
