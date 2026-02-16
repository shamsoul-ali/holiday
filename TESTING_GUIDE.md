# Testing Guide - What Works Now

**Current Status:** Frontend ✅, Backend ✅, 4/16 APIs ✅
**Last Updated:** 2026-02-16

---

## 🚀 Quick Start

### Services Running:
```bash
# Check status
curl http://localhost:3010  # Frontend (Next.js)
curl http://localhost:8000/api/system/health  # Backend (FastAPI)

# Both should return HTTP 200
```

### Access Points:
- **Frontend:** http://localhost:3010
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs (Swagger UI)
- **Health Check:** http://localhost:8000/api/system/health

---

## 1️⃣ Test Frontend (Web Interface)

### **URL:** http://localhost:3010

### What to Test:

#### A. Homepage
```
✅ Page loads
✅ Navigation menu visible
✅ Hero section displays
✅ "Plan Your Trip" button works
```

#### B. Trip Planning Form
```
1. Click "Plan Your Trip"
2. Fill in:
   - Destination: Tokyo (or Singapore, Paris, London)
   - Departure Date: 2026-03-15
   - Return Date: 2026-03-22
   - Travelers: 2 adults
   - Budget: RM 8000
   - Flight Class: Economy

3. Toggle preferences:
   ✅ Halal Friendly
   ✅ Culture & History
   ✅ City Life

4. Click "Generate Itinerary"
```

#### Expected Results:
```json
✅ Request submits (HTTP 200)
✅ Loading state shows
✅ Response returns with:
   - Weather forecast ✅
   - Budget breakdown ✅
   - Travel tips ✅
   - Emissions estimate ✅

❌ Itinerary options: Empty array []
   Reason: AI schema validation issue (see FINAL_STATUS.md)
```

#### Visual Test:
- Form validation works
- Date picker functions
- Budget calculator updates
- Responsive design (mobile/desktop)

---

## 2️⃣ Test Backend API (Direct)

### A. System Health Check

```bash
curl http://localhost:8000/api/system/health | python3 -m json.tool
```

**Expected:**
```json
{
  "status": "degraded",
  "timestamp": "2026-02-16T...",
  "api_keys": {
    "openai": {"is_configured": true, "is_valid": true},
    "amadeus": {"is_configured": true, "is_valid": true},
    "openweather": {"is_configured": true, "is_valid": true},
    "google_places": {"is_configured": true, "is_valid": true}
  },
  "database": {"status": "connected"},
  "redis": {"status": "connected"}
}
```

---

### B. AI Itinerary Generation

**Test Command:**
```bash
curl -X POST http://localhost:8000/api/planning/create \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "KUL",
    "destination": "Tokyo",
    "start_date": "2026-03-15",
    "end_date": "2026-03-22",
    "passengers": 2,
    "budget_per_person": 4000,
    "travel_style": "comfort",
    "preferences": {
      "halal_friendly": true,
      "culture_history": true,
      "city_life": true
    }
  }' | python3 -m json.tool
```

**Expected Response:**
```json
{
  "request_id": "itinerary_20260216_...",
  "title": "KUL → Tokyo (7 days)",
  "budget": {
    "total": 8000,
    "currency": "MYR",
    "per_person": 4000
  },
  "emissions_kg": 1005,
  "options": [],  // ❌ Empty (AI schema issue)
  "weather": {    // ✅ Works!
    "forecast": [
      {
        "date": "2026-02-16",
        "temperature": {"max": 13.7, "min": 5.2},
        "precipitation_probability": 88,
        "weather_description": "Overcast"
      }
    ]
  },
  "generated_at": "2026-02-16T...",
  "source": "holiday_ai"
}
```

**Processing Time:** ~10-20 seconds

---

### C. Test Individual API Endpoints

#### Weather API Test
```bash
curl -X POST http://localhost:8000/api/weather/forecast \
  -H "Content-Type: application/json" \
  -d '{"city": "Tokyo", "start_date": "2026-03-15", "end_date": "2026-03-22"}' \
  | python3 -m json.tool
```

**Expected:** 7-day weather forecast ✅

---

#### Flight Search Test (Amadeus)
```bash
curl -X POST http://localhost:8000/api/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "KUL",
    "destination": "TYO",
    "departure_date": "2026-03-15",
    "return_date": "2026-03-22",
    "passengers": 2
  }' | python3 -m json.tool
```

**Expected:** Flight options from Amadeus ✅

---

#### Hotel Search Test (Amadeus)
```bash
curl -X POST http://localhost:8000/api/hotels/search \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "TYO",
    "check_in": "2026-03-15",
    "check_out": "2026-03-22",
    "guests": 2
  }' | python3 -m json.tool
```

**Expected:** Hotel options from Amadeus ✅

---

#### Places Search Test (Google Places)
```bash
curl -X POST http://localhost:8000/api/places/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "restaurants in Tokyo",
    "type": "restaurant"
  }' | python3 -m json.tool
```

**Expected:** Restaurant listings from Google Places ✅

---

## 3️⃣ Test API Integrations

### A. Amadeus Flight Search (Fixed!)

**What was fixed:**
- ✅ Timeout increased (5s → 30s)
- ✅ Airport code normalization (Tokyo → TYO)
- ✅ Enhanced error logging

**Test:**
```bash
# Check logs for successful flight search
docker logs holiday_api 2>&1 | grep -E "(Searching Amadeus|Found.*flight)"
```

**Expected:**
```
Searching Amadeus flights: KUL -> TYO on 2026-03-15
Found 5 flight offers from Amadeus
```

---

### B. Amadeus Hotel Search (Fixed!)

**What was fixed:**
- ✅ 2-step process (v1 list + v3 offers)
- ✅ Price type conversion (string → float)

**Test:**
```bash
# Check logs for hotel search
docker logs holiday_api 2>&1 | grep -E "(Searching Amadeus hotels|Found.*hotel)"
```

**Expected:**
```
Searching Amadeus hotels in TYO
Found 10 hotel offers from Amadeus
```

---

### C. Google Places API (Newly Added!)

**What's available:**
- ✅ Hotels
- ✅ Restaurants (halal-friendly filtering)
- ✅ Tourist attractions
- ✅ Activities

**Test:**
```bash
# Verify API key is loaded
docker exec holiday_api env | grep GOOGLE_PLACES

# Should output:
# GOOGLE_PLACES_API_KEY=AIzaSyDu1hWjMBLguhAnXVQTpWVGLZEU1e4wWAg
```

---

## 4️⃣ Test Database & Caching

### A. PostgreSQL Database
```bash
# Check database connection
docker exec holiday_db psql -U holiday_user -d holiday_ai -c "SELECT version();"
```

**Expected:** PostgreSQL 15.x version info

---

### B. Redis Cache
```bash
# Check Redis connection
docker exec holiday_redis redis-cli ping
```

**Expected:** `PONG`

---

### C. Cache Performance Test
```bash
# First request (no cache)
time curl -s -X POST http://localhost:8000/api/planning/create \
  -H "Content-Type: application/json" \
  -d '{"origin":"KUL","destination":"Singapore","start_date":"2026-03-20","end_date":"2026-03-25","passengers":2,"budget_per_person":3000}' \
  -o /dev/null

# Second identical request (should use cache)
time curl -s -X POST http://localhost:8000/api/planning/create \
  -H "Content-Type: application/json" \
  -d '{"origin":"KUL","destination":"Singapore","start_date":"2026-03-20","end_date":"2026-03-25","passengers":2,"budget_per_person":3000}' \
  -o /dev/null
```

**Expected:** Second request should be faster (cached)

---

## 5️⃣ Test Features That Work

### ✅ Working Features:

| Feature | Status | Notes |
|---------|--------|-------|
| Frontend UI | ✅ | All pages load |
| Trip planning form | ✅ | Validation works |
| API proxy | ✅ | Next.js → FastAPI |
| Weather forecast | ✅ | 7-day forecast |
| Flight search (Amadeus) | ✅ | 30s timeout |
| Hotel search (Amadeus) | ✅ | 2-step process |
| Google Places | ✅ | Ready to use |
| Airport code normalization | ✅ | City → IATA |
| Budget calculation | ✅ | Per person/total |
| Database connection | ✅ | PostgreSQL |
| Cache system | ✅ | Redis |
| Error logging | ✅ | Detailed logs |

---

## 6️⃣ Test Different Destinations

### A. Popular Destinations to Try:

```bash
# Singapore (close, budget-friendly)
{"origin":"KUL","destination":"Singapore","start_date":"2026-03-20","end_date":"2026-03-23","passengers":2,"budget_per_person":2000}

# Tokyo (medium range)
{"origin":"KUL","destination":"Tokyo","start_date":"2026-03-15","end_date":"2026-03-22","passengers":2,"budget_per_person":4000}

# Paris (long-haul)
{"origin":"KUL","destination":"Paris","start_date":"2026-04-10","end_date":"2026-04-20","passengers":2,"budget_per_person":8000}

# London (halal-friendly)
{"origin":"KUL","destination":"London","start_date":"2026-05-01","end_date":"2026-05-08","passengers":2,"budget_per_person":6000}

# Istanbul (Muslim-friendly)
{"origin":"KUL","destination":"Istanbul","start_date":"2026-06-15","end_date":"2026-06-25","passengers":2,"budget_per_person":5000}
```

---

## 7️⃣ Test Error Scenarios

### A. Invalid Input Tests

**Test 1: Missing Required Fields**
```bash
curl -X POST http://localhost:8000/api/planning/create \
  -H "Content-Type: application/json" \
  -d '{"origin":"KUL"}' | python3 -m json.tool
```
**Expected:** HTTP 422 - Validation error

---

**Test 2: Invalid Date Range**
```bash
curl -X POST http://localhost:8000/api/planning/create \
  -H "Content-Type: application/json" \
  -d '{"origin":"KUL","destination":"Tokyo","start_date":"2026-03-22","end_date":"2026-03-15","passengers":2,"budget_per_person":4000}' \
  | python3 -m json.tool
```
**Expected:** Error - end_date before start_date

---

**Test 3: Invalid Airport Code**
```bash
curl -X POST http://localhost:8000/api/planning/create \
  -H "Content-Type: application/json" \
  -d '{"origin":"INVALID","destination":"Tokyo","start_date":"2026-03-15","end_date":"2026-03-22","passengers":2,"budget_per_person":4000}' \
  | python3 -m json.tool
```
**Expected:** Error - invalid origin code

---

## 8️⃣ Check Logs for Debugging

### View Recent Logs
```bash
# Last 100 lines
docker logs holiday_api 2>&1 | tail -100

# Filter for errors
docker logs holiday_api 2>&1 | grep -i error

# Filter for API calls
docker logs holiday_api 2>&1 | grep -E "(Amadeus|Google Places|OpenAI)"

# Watch logs in real-time
docker logs -f holiday_api
```

---

## 9️⃣ Performance Tests

### A. Response Time Test
```bash
# Time a full request
time curl -s -X POST http://localhost:8000/api/planning/create \
  -H "Content-Type: application/json" \
  -d '{"origin":"KUL","destination":"Tokyo","start_date":"2026-03-15","end_date":"2026-03-22","passengers":2,"budget_per_person":4000}' \
  -o /dev/null
```

**Expected:** ~10-20 seconds (includes OpenAI API call)

---

### B. Concurrent Requests Test
```bash
# Run 5 parallel requests
for i in {1..5}; do
  curl -s -X POST http://localhost:8000/api/planning/create \
    -H "Content-Type: application/json" \
    -d '{"origin":"KUL","destination":"Singapore","start_date":"2026-03-20","end_date":"2026-03-23","passengers":2,"budget_per_person":2000}' \
    -o /dev/null &
done
wait
```

**Expected:** All requests complete without errors

---

## 🔟 What Doesn't Work (Yet)

### ❌ Known Issues:

1. **Empty Itinerary Options**
   - **Why:** AI response schema doesn't match Pydantic models
   - **Fix:** Update AI prompt (see FINAL_STATUS.md)
   - **Impact:** Can't see generated trip options

2. **No Activity Data**
   - **Why:** Google Places integration not fully connected
   - **Fix:** Wire up Places API in orchestrator
   - **Impact:** Missing POI suggestions

3. **Limited API Coverage**
   - **Status:** 4/16 APIs configured
   - **Missing:** Kiwi, Skyscanner, Expedia, etc.
   - **Impact:** Fewer flight/hotel options

---

## 🎯 Testing Checklist

### Before Each Test:
- [ ] All containers running (`docker ps`)
- [ ] Frontend accessible (http://localhost:3010)
- [ ] Backend healthy (http://localhost:8000/api/system/health)

### Basic Functionality:
- [ ] Homepage loads
- [ ] Trip form submits
- [ ] Weather data returns
- [ ] Budget calculation correct
- [ ] Halal filter works

### API Integration:
- [ ] Amadeus flights return data
- [ ] Amadeus hotels return data
- [ ] Google Places configured
- [ ] OpenAI responds (check logs)

### Error Handling:
- [ ] Invalid input rejected
- [ ] Error messages clear
- [ ] Logs show detailed errors

---

## 📞 Troubleshooting

### Issue: "Connection refused"
```bash
# Check if services are running
docker ps

# Restart services
cd "/Users/shamsoul/Documents/Holiday Ai "
docker-compose restart
```

### Issue: "API key not configured"
```bash
# Check environment variables
docker exec holiday_api env | grep API_KEY

# Should see: OPENAI, AMADEUS, OPENWEATHER, GOOGLE_PLACES
```

### Issue: "Empty response"
```bash
# Check logs for errors
docker logs holiday_api 2>&1 | tail -50

# Look for validation errors
docker logs holiday_api 2>&1 | grep "validation error"
```

---

## 🚀 Next Steps After Testing

1. **If everything works:** Fix AI schema validation (FINAL_STATUS.md)
2. **If errors occur:** Check logs and update this guide
3. **To add more features:** See PROJECT_STATUS.md roadmap

---

**Generated:** 2026-02-16
**Test Status:** ✅ Ready to test
**Services:** Frontend ✅ Backend ✅ Database ✅ Redis ✅
