# API Keys Setup Guide 🔑

## 🎯 Priority Setup (Start Here)

Configure these APIs first for immediate functionality:

## 🚀 Quick Configuration

### **Step 1: Copy the template**
```bash
cd "/Users/shamsoul/Documents/Holiday Ai/"
cp quick-setup.env .env
```

### **Step 2: Add your API keys**
Edit `.env` file and replace the placeholder values:

```bash
# Priority APIs (start with these)
OPENWEATHER_API_KEY=YOUR_ACTUAL_KEY_HERE
OPENAI_API_KEY=sk-YOUR_ACTUAL_KEY_HERE  
GOOGLE_PLACES_API_KEY=YOUR_ACTUAL_KEY_HERE
AMADEUS_CLIENT_ID=YOUR_ACTUAL_ID_HERE
AMADEUS_CLIENT_SECRET=YOUR_ACTUAL_SECRET_HERE
```

### **Step 3: Restart and validate**
```bash
# Restart API service
docker-compose restart api

# Check system health (wait 30 seconds)
curl "http://localhost:8000/api/system/health"
```

## 📋 Detailed API Setup Instructions

### **1. OpenWeather API** ⛅ (5 minutes)
**Cost:** FREE (1,000 calls/day)
**Purpose:** Real-time weather data and forecasts

**Steps:**
1. Go to [openweathermap.org/api](https://openweathermap.org/api)
2. Click "Sign Up" → Create free account
3. Check your email and verify account
4. Login → Go to "API keys" section
5. Copy the default API key
6. Add to `.env`: `OPENWEATHER_API_KEY=your_key_here`

### **2. OpenAI API** 🧠 (10 minutes)  
**Cost:** $20 minimum credit (pay per use)
**Purpose:** AI-powered itinerary generation

**Steps:**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account or sign in
3. Add payment method + $20 credit
4. Go to "API keys" → "Create new secret key"
5. Copy key (starts with "sk-")
6. Add to `.env`: `OPENAI_API_KEY=sk-your_key_here`

### **3. Google Places API** 📍 (15 minutes)
**Cost:** FREE (100,000 requests/month)
**Purpose:** Activities, restaurants, attractions

**Steps:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project: "Holiday AI"
3. Enable APIs: "Places API" + "Maps JavaScript API"
4. Go to "Credentials" → "Create credentials" → "API key"
5. Restrict API key to the enabled APIs
6. Add to `.env`: `GOOGLE_PLACES_API_KEY=your_key_here`

### **4. Amadeus Travel API** ✈️ (10 minutes)
**Cost:** FREE (2,000 calls/month)
**Purpose:** Flight and hotel search

**Steps:**
1. Go to [developers.amadeus.com](https://developers.amadeus.com)
2. Create account → "My Apps" → "Create New App"
3. App name: "Holiday AI Platform"
4. Select APIs: "Flight Search" + "Hotel Search"
5. Copy Client ID and Client Secret
6. Add to `.env`:
   ```
   AMADEUS_CLIENT_ID=your_client_id
   AMADEUS_CLIENT_SECRET=your_client_secret
   ```

### **5. Stripe Payments** 💳 (10 minutes)
**Cost:** FREE (2.9% + 30¢ per transaction)
**Purpose:** Payment processing

**Steps:**
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Create account → Skip business details for testing
3. Go to "API keys" (test mode)
4. Copy "Publishable key" and "Secret key"
5. Add to `.env`:
   ```
   STRIPE_PUBLISHABLE_KEY=pk_test_your_key
   STRIPE_SECRET_KEY=sk_test_your_key
   ```

## 🎯 **Priority Order for Maximum Impact**

### **Phase 1 (30 minutes)** - Basic functionality
1. ✅ OpenWeather API → Real weather data
2. ✅ Google Places API → Activities and restaurants
3. ✅ OpenAI API → AI itinerary generation

**Result:** Working destination recommendations with weather and AI

### **Phase 2 (20 minutes)** - Travel data  
4. ✅ Amadeus API → Flight and hotel search
5. ✅ Stripe API → Payment processing

**Result:** Full booking platform with payments

### **Phase 3 (Optional)** - Enhanced data
6. Kiwi API → Alternative flight search
7. Expedia API → More hotel options
8. GetYourGuide API → Activity bookings
9. Ticketmaster API → Event discovery

## ⚡ **Instant Validation**

After adding each API key, test immediately:

```bash
# Check system health
curl "http://localhost:8000/api/system/health"

# Test specific API
curl "http://localhost:8000/api/system/api-keys/status"

# Test recommendations
curl "http://localhost:8000/api/top10?budget=5000&currency=MYR&pax=2"
```

## 🛠️ **Alternative APIs (If Primary Fails)**

### **Instead of OpenAI:**
- **Anthropic Claude:** [console.anthropic.com](https://console.anthropic.com)
- Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-your_key_here`

### **Instead of Amadeus:**
- **Kiwi/Tequila:** [tequila.kiwi.com](https://tequila.kiwi.com/portal/login)
- Add to `.env`: `KIWI_API_KEY=your_kiwi_key_here`

### **Instead of Google Places:**
- **Yelp API:** [developer.yelp.com](https://www.yelp.com/developers)
- Add to `.env`: `YELP_API_KEY=your_yelp_key_here`

## 🎊 **Results After Setup**

With just the **5 priority APIs**, your platform will have:
- ✅ Real-time weather-based recommendations
- ✅ AI-generated personalized itineraries  
- ✅ Live flight and hotel search
- ✅ Activities and restaurant suggestions
- ✅ Payment processing for bookings
- ✅ All data cached for performance

**Your Holiday AI platform will be fully functional!** 🚀

## 📞 **Need Help?**

If you encounter issues:
1. Check system health: `curl "http://localhost:8000/api/system/health"`
2. Verify API key format (no spaces, correct prefixes)
3. Check API provider documentation
4. Test one API at a time
5. Review logs: `docker-compose logs api`