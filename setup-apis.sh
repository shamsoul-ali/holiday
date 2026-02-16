#!/bin/bash

# Holiday AI Platform - API Setup Script
# This script helps you configure API keys step by step

echo "🚀 Holiday AI Platform - API Setup"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to prompt for API key
prompt_api_key() {
    local service=$1
    local var_name=$2
    local description=$3
    local url=$4
    local required=$5
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}$service${NC}"
    echo -e "Description: $description"
    echo -e "Get API key: ${BLUE}$url${NC}"
    
    if [ "$required" = "true" ]; then
        echo -e "${RED}[REQUIRED]${NC}"
    else
        echo -e "${GREEN}[OPTIONAL]${NC}"
    fi
    
    echo ""
    read -p "Enter your $service API key (or press Enter to skip): " api_key
    
    if [ ! -z "$api_key" ]; then
        # Add to .env file
        if grep -q "^$var_name=" .env 2>/dev/null; then
            # Replace existing line
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s|^$var_name=.*|$var_name=$api_key|" .env
            else
                sed -i "s|^$var_name=.*|$var_name=$api_key|" .env
            fi
        else
            # Add new line
            echo "$var_name=$api_key" >> .env
        fi
        echo -e "${GREEN}✅ $service API key saved${NC}"
    else
        echo -e "${YELLOW}⏭️  Skipped $service${NC}"
    fi
    echo ""
}

# Check if .env exists, if not create from template
if [ ! -f .env ]; then
    if [ -f quick-setup.env ]; then
        cp quick-setup.env .env
        echo -e "${GREEN}✅ Created .env file from template${NC}"
    else
        echo -e "${RED}❌ Template file 'quick-setup.env' not found${NC}"
        echo "Please make sure you're in the correct directory."
        exit 1
    fi
fi

echo "This script will help you configure API keys for Holiday AI Platform."
echo "You can skip any API and add keys later."
echo ""
echo -e "${YELLOW}🎯 Priority APIs (Recommended to configure first):${NC}"
echo ""

# Priority APIs
prompt_api_key "OpenWeather" "OPENWEATHER_API_KEY" "Real-time weather data and forecasts" "https://openweathermap.org/api" "true"
prompt_api_key "OpenAI" "OPENAI_API_KEY" "AI-powered itinerary generation" "https://platform.openai.com/api-keys" "true"
prompt_api_key "Google Places" "GOOGLE_PLACES_API_KEY" "Activities, restaurants, attractions" "https://console.cloud.google.com/" "true"

echo ""
echo -e "${YELLOW}✈️ Travel Search APIs:${NC}"
echo ""

prompt_api_key "Amadeus" "AMADEUS_CLIENT_ID" "Flight and hotel search - Client ID" "https://developers.amadeus.com/" "true"
if grep -q "AMADEUS_CLIENT_ID=" .env && ! grep -q "AMADEUS_CLIENT_ID=your_" .env; then
    prompt_api_key "Amadeus Secret" "AMADEUS_CLIENT_SECRET" "Flight and hotel search - Client Secret" "https://developers.amadeus.com/" "true"
fi

prompt_api_key "Kiwi/Tequila" "KIWI_API_KEY" "Alternative flight search" "https://tequila.kiwi.com/portal/login" "false"

echo ""
echo -e "${YELLOW}💳 Payment Processing:${NC}"
echo ""

prompt_api_key "Stripe Publishable" "STRIPE_PUBLISHABLE_KEY" "Payment processing - Publishable Key" "https://dashboard.stripe.com/apikeys" "false"
if grep -q "STRIPE_PUBLISHABLE_KEY=" .env && ! grep -q "STRIPE_PUBLISHABLE_KEY=your_" .env; then
    prompt_api_key "Stripe Secret" "STRIPE_SECRET_KEY" "Payment processing - Secret Key" "https://dashboard.stripe.com/apikeys" "false"
fi

echo ""
echo -e "${YELLOW}🎁 Optional APIs (Enhanced functionality):${NC}"
echo ""

read -p "Do you want to configure optional APIs? (y/n): " configure_optional

if [ "$configure_optional" = "y" ] || [ "$configure_optional" = "Y" ]; then
    prompt_api_key "Anthropic Claude" "ANTHROPIC_API_KEY" "Alternative AI service" "https://console.anthropic.com/" "false"
    prompt_api_key "Expedia Rapid" "EXPEDIA_RAPID_API_KEY" "Hotel search" "https://developers.expediagroup.com/" "false"
    prompt_api_key "GetYourGuide" "GETYOURGUIDE_API_KEY" "Activity bookings" "https://partner.getyourguide.com/" "false"
    prompt_api_key "Viator" "VIATOR_API_KEY" "Experience bookings" "https://developer.viator.com/" "false"
    prompt_api_key "Ticketmaster" "TICKETMASTER_API_KEY" "Event discovery" "https://developer.ticketmaster.com/" "false"
fi

echo ""
echo -e "${GREEN}🎉 API Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Restart the API service: ${BLUE}docker-compose restart api${NC}"
echo "2. Wait 30 seconds for startup"
echo "3. Check system health: ${BLUE}curl \"http://localhost:8000/api/system/health\"${NC}"
echo "4. Test recommendations: ${BLUE}curl \"http://localhost:8000/api/top10?budget=5000&currency=MYR&pax=2\"${NC}"
echo ""
echo -e "${YELLOW}📖 For detailed setup instructions, see: API_KEYS_GUIDE.md${NC}"

# Restart service if user wants
echo ""
read -p "Would you like to restart the API service now? (y/n): " restart_service

if [ "$restart_service" = "y" ] || [ "$restart_service" = "Y" ]; then
    echo ""
    echo -e "${BLUE}🔄 Restarting API service...${NC}"
    docker-compose restart api
    
    echo ""
    echo -e "${GREEN}✅ API service restarted!${NC}"
    echo -e "${YELLOW}⏳ Waiting 30 seconds for startup...${NC}"
    
    for i in {30..1}; do
        echo -ne "\r${YELLOW}Waiting... $i seconds${NC}"
        sleep 1
    done
    echo ""
    
    echo ""
    echo -e "${BLUE}🧪 Testing system health...${NC}"
    
    if command -v curl &> /dev/null; then
        health_response=$(curl -s "http://localhost:8000/api/system/health" || echo "error")
        if [[ $health_response == *"healthy"* ]] || [[ $health_response == *"degraded"* ]]; then
            echo -e "${GREEN}✅ System is responding!${NC}"
            echo ""
            echo "🎯 Quick test commands:"
            echo "${BLUE}curl \"http://localhost:8000/api/system/health\"${NC}"
            echo "${BLUE}curl \"http://localhost:8000/api/top10?budget=5000&currency=MYR&pax=2\"${NC}"
        else
            echo -e "${RED}❌ System not responding. Check logs: docker-compose logs api${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  curl not found. Check manually: http://localhost:8000/api/system/health${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🚀 Your Holiday AI platform is ready!${NC}"