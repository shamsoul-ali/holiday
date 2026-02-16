"""
AI Client Service - OpenAI and Anthropic integration
Handles AI model interactions for itinerary generation and recommendations
"""

import os
import json
import asyncio
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
import logging
from enum import Enum

import openai
import anthropic
from config.api_keys import api_key_manager, APIProvider

logger = logging.getLogger(__name__)

class AIModel(Enum):
    GPT_4 = "gpt-4"
    GPT_4_TURBO = "gpt-4-turbo-preview"
    GPT_3_5_TURBO = "gpt-3.5-turbo"
    CLAUDE_3_SONNET = "claude-3-sonnet-20240229"
    CLAUDE_3_HAIKU = "claude-3-haiku-20240307"

class AIClient:
    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None
        self._initialize_clients()
    
    def _initialize_clients(self):
        """Initialize AI clients based on available API keys"""
        # Initialize OpenAI client
        openai_config = api_key_manager.get_config(APIProvider.OPENAI)
        if openai_config and openai_config.key:
            self.openai_client = openai.AsyncOpenAI(
                api_key=openai_config.key
            )
            logger.info("OpenAI client initialized")
        
        # Initialize Anthropic client
        anthropic_config = api_key_manager.get_config(APIProvider.ANTHROPIC)
        if anthropic_config and anthropic_config.key:
            self.anthropic_client = anthropic.AsyncAnthropic(
                api_key=anthropic_config.key
            )
            logger.info("Anthropic client initialized")
    
    async def generate_itinerary_recommendations(
        self,
        destination: str,
        budget: float,
        duration: int,
        preferences: Dict[str, Any],
        flight_options: List[Dict],
        hotel_options: List[Dict],
        activity_options: List[Dict],
        weather_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate AI-powered itinerary recommendations"""
        
        # Build comprehensive prompt
        prompt = self._build_itinerary_prompt(
            destination, budget, duration, preferences,
            flight_options, hotel_options, activity_options, weather_data
        )
        
        try:
            # Try OpenAI first (primary)
            if self.openai_client:
                response = await self._generate_with_openai(prompt)
                if response:
                    return response
            
            # Fallback to Anthropic
            if self.anthropic_client:
                response = await self._generate_with_anthropic(prompt)
                if response:
                    return response
            
            # If both fail, return structured fallback
            return self._generate_fallback_itinerary(
                destination, budget, duration, preferences,
                flight_options, hotel_options, activity_options
            )
            
        except Exception as e:
            logger.error(f"AI itinerary generation failed: {e}")
            return self._generate_fallback_itinerary(
                destination, budget, duration, preferences,
                flight_options, hotel_options, activity_options
            )
    
    async def _generate_with_openai(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Generate itinerary using OpenAI GPT"""
        try:
            response = await self.openai_client.chat.completions.create(
                model=AIModel.GPT_4_TURBO.value,
                messages=[
                    {
                        "role": "system",
                        "content": """You are an expert travel planner specializing in personalized itineraries. 
                        You excel at creating detailed, practical travel plans that balance budget, preferences, and local insights.
                        Always respond with valid JSON format."""
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=2000,
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            return json.loads(content)
            
        except Exception as e:
            logger.error(f"OpenAI generation failed: {e}")
            return None
    
    async def _generate_with_anthropic(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Generate itinerary using Anthropic Claude"""
        try:
            response = await self.anthropic_client.messages.create(
                model=AIModel.CLAUDE_3_SONNET.value,
                max_tokens=2000,
                temperature=0.7,
                system="""You are an expert travel planner specializing in personalized itineraries. 
                You excel at creating detailed, practical travel plans that balance budget, preferences, and local insights.
                Always respond with valid JSON format.""",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            content = response.content[0].text
            return json.loads(content)
            
        except Exception as e:
            logger.error(f"Anthropic generation failed: {e}")
            return None
    
    def _build_itinerary_prompt(
        self,
        destination: str,
        budget: float,
        duration: int,
        preferences: Dict[str, Any],
        flight_options: List[Dict],
        hotel_options: List[Dict],
        activity_options: List[Dict],
        weather_data: Dict[str, Any]
    ) -> str:
        """Build comprehensive prompt for AI itinerary generation"""
        
        # Extract key preference flags
        is_halal = preferences.get("halal_friendly", False)
        is_family = preferences.get("family_friendly", False)
        is_luxury = preferences.get("luxury", False)
        is_budget = preferences.get("budget", False)
        
        prompt = f"""
Create a detailed travel itinerary for {destination} with the following requirements:

TRIP DETAILS:
- Destination: {destination}
- Duration: {duration} days
- Budget: {budget:.0f} MYR total
- Halal requirements: {is_halal}
- Family-friendly: {is_family}
- Luxury preference: {is_luxury}
- Budget-conscious: {is_budget}

AVAILABLE OPTIONS:
Flight Options: {json.dumps(flight_options[:3], indent=2) if flight_options else 'No flights found'}

Hotel Options: {json.dumps(hotel_options[:5], indent=2) if hotel_options else 'No hotels found'}

Activity Options: {json.dumps(activity_options[:8], indent=2) if activity_options else 'No activities found'}

Weather Data: {json.dumps(weather_data, indent=2) if weather_data else 'No weather data available'}

Please generate 3 itinerary options (Budget, Comfort, Luxury) with the following JSON structure:

{{
  "itinerary_options": [
    {{
      "tier": "BUDGET",
      "title": "Affordable Adventure",
      "description": "Smart savings without compromising experience",
      "total_cost": 0,
      "currency": "MYR",
      "selected_flight": {{}},
      "selected_hotel": {{}},
      "daily_itinerary": [
        {{
          "day": 1,
          "theme": "Arrival & Exploration",
          "activities": [
            {{
              "time": "09:00",
              "activity": "Activity name",
              "description": "Detailed description",
              "duration": "2 hours",
              "cost": 0,
              "location": "Address",
              "tips": ["Local tip 1", "Local tip 2"]
            }}
          ],
          "meals": [
            {{
              "time": "12:00",
              "type": "lunch",
              "restaurant": "Restaurant name",
              "cuisine": "Local cuisine",
              "cost": 0,
              "halal_certified": true,
              "recommendation": "Why this place"
            }}
          ],
          "transportation": "How to get around",
          "daily_budget": 0
        }}
      ],
      "included_activities": [],
      "travel_tips": [
        "Practical tip 1",
        "Practical tip 2",
        "Local insight 3"
      ],
      "packing_suggestions": ["Item 1", "Item 2"],
      "local_customs": ["Custom 1", "Custom 2"],
      "emergency_info": {{
        "police": "Emergency number",
        "hospital": "Hospital contact",
        "embassy": "Embassy contact"
      }}
    }}
  ],
  "destination_insights": {{
    "best_time_to_visit": "Month range and why",
    "local_currency": "Currency and exchange tips",
    "language": "Primary language and useful phrases",
    "cultural_notes": ["Note 1", "Note 2"],
    "weather_advisory": "What to expect during travel dates"
  }},
  "booking_recommendations": {{
    "flight_booking": "When and where to book",
    "hotel_booking": "Best platforms and timing",
    "activity_booking": "Advance booking requirements"
  }}
}}

IMPORTANT GUIDELINES:
1. Ensure all costs are within the specified budget
2. Respect halal and family preferences if specified
3. Create realistic day-by-day schedules with proper timing
4. Include local experiences and hidden gems
5. Provide practical tips and local insights
6. Consider weather data for activity recommendations
7. Include transportation between activities
8. Suggest authentic local restaurants (halal if required)
9. Add cultural sensitivity notes
10. Provide emergency contact information

Make each itinerary tier distinctly different in terms of accommodation quality, activity selection, and overall experience level while staying within realistic budget constraints.
"""
        
        return prompt.strip()
    
    def _generate_fallback_itinerary(
        self,
        destination: str,
        budget: float,
        duration: int,
        preferences: Dict[str, Any],
        flight_options: List[Dict],
        hotel_options: List[Dict],
        activity_options: List[Dict]
    ) -> Dict[str, Any]:
        """Generate basic structured itinerary when AI services are unavailable"""
        
        return {
            "itinerary_options": [
                {
                    "tier": "BUDGET",
                    "title": f"Budget Explorer - {destination}",
                    "description": "Affordable adventure with smart savings",
                    "total_cost": budget * 0.7,
                    "currency": "MYR",
                    "selected_flight": flight_options[0] if flight_options else {},
                    "selected_hotel": hotel_options[0] if hotel_options else {},
                    "daily_itinerary": self._create_basic_daily_plan(destination, duration),
                    "included_activities": activity_options[:3] if activity_options else [],
                    "travel_tips": [
                        f"Visit {destination} during shoulder season for better prices",
                        "Use public transportation to save money",
                        "Try local street food for authentic experiences"
                    ],
                    "packing_suggestions": ["Comfortable walking shoes", "Weather-appropriate clothing"],
                    "local_customs": ["Research local customs before arrival"],
                    "emergency_info": {
                        "police": "Contact local police: 999",
                        "hospital": "Find nearest hospital",
                        "embassy": "Contact your embassy"
                    }
                }
            ],
            "destination_insights": {
                "best_time_to_visit": "Research seasonal weather patterns",
                "local_currency": "Check current exchange rates",
                "language": "Learn basic local phrases",
                "cultural_notes": ["Respect local customs", "Dress appropriately"],
                "weather_advisory": "Check weather forecast before departure"
            },
            "booking_recommendations": {
                "flight_booking": "Book flights 2-8 weeks in advance",
                "hotel_booking": "Compare prices across multiple platforms",
                "activity_booking": "Book popular attractions in advance"
            },
            "ai_status": "Generated using fallback system - for personalized recommendations, configure AI API keys"
        }
    
    def _create_basic_daily_plan(self, destination: str, duration: int) -> List[Dict]:
        """Create basic daily itinerary structure"""
        daily_plans = []
        
        for day in range(1, duration + 1):
            if day == 1:
                theme = "Arrival & City Overview"
                activities = [
                    {
                        "time": "10:00",
                        "activity": f"Explore {destination} city center",
                        "description": "Get oriented with the main attractions",
                        "duration": "3 hours",
                        "cost": 0,
                        "location": "City center",
                        "tips": ["Use walking maps", "Ask locals for recommendations"]
                    }
                ]
            elif day == duration:
                theme = "Final Exploration & Departure"
                activities = [
                    {
                        "time": "09:00",
                        "activity": "Last-minute shopping and sightseeing",
                        "description": "Visit any missed attractions",
                        "duration": "2 hours",
                        "cost": 50,
                        "location": "Shopping district",
                        "tips": ["Leave time for airport travel", "Pack souvenirs safely"]
                    }
                ]
            else:
                theme = f"Day {day} Adventures"
                activities = [
                    {
                        "time": "09:00",
                        "activity": f"{destination} highlight exploration",
                        "description": "Discover local attractions and culture",
                        "duration": "4 hours",
                        "cost": 100,
                        "location": "Various locations",
                        "tips": ["Start early to avoid crowds", "Bring water and snacks"]
                    }
                ]
            
            daily_plans.append({
                "day": day,
                "theme": theme,
                "activities": activities,
                "meals": [
                    {
                        "time": "12:00",
                        "type": "lunch",
                        "restaurant": "Local restaurant",
                        "cuisine": "Local cuisine",
                        "cost": 30,
                        "halal_certified": False,
                        "recommendation": "Try authentic local dishes"
                    }
                ],
                "transportation": "Use local public transportation",
                "daily_budget": 150
            })
        
        return daily_plans

    async def generate_destination_recommendations(
        self,
        budget: float,
        preferences: Dict[str, Any],
        travel_month: str
    ) -> Dict[str, Any]:
        """Generate AI-powered destination recommendations"""
        
        prompt = f"""
Based on the following criteria, recommend the top 10 travel destinations:

CRITERIA:
- Budget: {budget} MYR
- Travel Month: {travel_month}
- Preferences: {json.dumps(preferences, indent=2)}

Provide recommendations in this JSON format:
{{
  "destinations": [
    {{
      "destination_code": "TYO",
      "name": "Tokyo, Japan",
      "popularity_score": 87.3,
      "budget_fit_score": 0.75,
      "weather_score": 0.85,
      "preference_match": 0.90,
      "highlights": ["Cultural experiences", "Amazing food", "Safe for families"],
      "estimated_cost": 4500,
      "weather_summary": "Cool and comfortable in {travel_month}",
      "special_events": ["Event 1", "Event 2"]
    }}
  ]
}}
"""
        
        try:
            if self.openai_client:
                response = await self._generate_with_openai(prompt)
                if response:
                    return response
                
            if self.anthropic_client:
                response = await self._generate_with_anthropic(prompt)
                if response:
                    return response
            
            # Fallback to structured recommendations
            return self._generate_fallback_destinations(budget, preferences, travel_month)
            
        except Exception as e:
            logger.error(f"AI destination recommendations failed: {e}")
            return self._generate_fallback_destinations(budget, preferences, travel_month)
    
    def _generate_fallback_destinations(self, budget: float, preferences: Dict, travel_month: str) -> Dict:
        """Fallback destination recommendations"""
        return {
            "destinations": [
                {
                    "destination_code": "BKK",
                    "name": "Bangkok, Thailand", 
                    "popularity_score": 92.1,
                    "budget_fit_score": 0.85,
                    "weather_score": 0.75,
                    "preference_match": 0.80,
                    "highlights": ["Great value", "Amazing food", "Rich culture"],
                    "estimated_cost": budget * 0.6,
                    "weather_summary": f"Tropical climate in {travel_month}",
                    "special_events": ["Local festivals"]
                }
            ],
            "ai_status": "Using fallback recommendations - configure AI API keys for personalized suggestions"
        }

# Global instance
ai_client = AIClient()