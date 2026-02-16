"""
AI Orchestration Service - The "Itinerary Brain"
Coordinates all travel APIs and generates intelligent itineraries
"""

import os
import asyncio
import json
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from fastapi import HTTPException
import logging

from clients import (
    amadeus_client, kiwi_client, places_client, weather_client,
    google_travel_client, tripadvisor_client, skyscanner_client, expedia_client
)
from models.itinerary import ItineraryRequest, ItineraryResponse, TripOption
from models.flight import FlightOffer
from models.hotel import HotelOffer
from models.activity import ActivityOffer

logger = logging.getLogger(__name__)

class AIOrchestrator:
    # Common city to airport code mappings
    CITY_AIRPORT_MAP = {
        "tokyo": "TYO",
        "paris": "PAR",
        "london": "LON",
        "new york": "NYC",
        "singapore": "SIN",
        "dubai": "DXB",
        "bangkok": "BKK",
        "hong kong": "HKG",
        "seoul": "SEL",
        "sydney": "SYD",
        "melbourne": "MEL",
        "rome": "ROM",
        "barcelona": "BCN",
        "amsterdam": "AMS",
        "istanbul": "IST",
        "kuala lumpur": "KUL",
        "jakarta": "JKT",
        "manila": "MNL",
        "taipei": "TPE",
        "osaka": "OSA",
        "mumbai": "BOM",
        "delhi": "DEL",
        "beijing": "BJS",
        "shanghai": "SHA",
        "los angeles": "LAX",
        "san francisco": "SFO",
        "chicago": "CHI",
        "miami": "MIA",
        "toronto": "YTO",
        "vancouver": "YVR",
        "montreal": "YMQ",
        "berlin": "BER",
        "frankfurt": "FRA",
        "munich": "MUC",
        "madrid": "MAD",
        "lisbon": "LIS",
        "vienna": "VIE",
        "prague": "PRG",
        "budapest": "BUD",
        "zurich": "ZRH",
        "geneva": "GVA",
        "milan": "MIL",
        "venice": "VCE",
        "athens": "ATH",
        "cairo": "CAI",
        "cape town": "CPT",
        "johannesburg": "JNB",
        "nairobi": "NBO",
        "casablanca": "CAS",
        "doha": "DOH",
        "abu dhabi": "AUH",
        "jeddah": "JED",
        "riyadh": "RUH",
        "mecca": "JED",  # Closest airport to Mecca
        "medina": "MED"
    }

    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")

        if not self.openai_key and not self.anthropic_key:
            logger.warning("No AI API keys configured")

    def _normalize_destination(self, destination: str) -> str:
        """Convert city name to airport code if needed"""
        # If already an airport code (3 letters, uppercase), return as-is
        if len(destination) == 3 and destination.isupper():
            return destination

        # Try to find in city mapping
        city_lower = destination.lower().strip()
        airport_code = self.CITY_AIRPORT_MAP.get(city_lower)

        if airport_code:
            logger.info(f"Converted '{destination}' to airport code '{airport_code}'")
            return airport_code

        # If not found, return original (might be a valid IATA code)
        logger.warning(f"No airport mapping for '{destination}', using as-is")
        return destination
    
    async def create_itinerary(
        self,
        request: ItineraryRequest
    ) -> ItineraryResponse:
        """Create a complete AI-generated itinerary"""
        try:
            # Step 1: Validate and normalize request
            normalized_request = await self._normalize_request(request)
            
            # Step 2: Search for flights
            flight_offers = await self._search_flights(normalized_request)
            
            # Step 3: Search for hotels
            hotel_offers = await self._search_hotels(normalized_request)
            
            # Step 4: Search for activities and places
            activity_offers = await self._search_activities(normalized_request)
            
            # Step 5: Get weather and local information
            weather_data = await self._get_weather_data(normalized_request)
            
            # Step 6: Generate AI itinerary options
            itinerary_options = await self._generate_ai_itineraries(
                normalized_request,
                flight_offers,
                hotel_offers,
                activity_offers,
                weather_data
            )
            
            # Step 7: Calculate emissions and finalize
            final_itinerary = await self._finalize_itinerary(
                normalized_request,
                itinerary_options,
                weather_data
            )
            
            return final_itinerary
            
        except Exception as e:
            logger.error(f"Itinerary creation failed: {e}")
            raise HTTPException(status_code=500, detail=f"Itinerary creation failed: {str(e)}")
    
    async def _normalize_request(self, request: ItineraryRequest) -> Dict[str, Any]:
        """Normalize and validate the itinerary request"""
        try:
            # Convert destination to coordinates if needed
            destination_coords = await self._get_destination_coordinates(request.destination)
            
            # Calculate trip duration
            start_date = datetime.strptime(request.start_date, "%Y-%m-%d")
            end_date = datetime.strptime(request.end_date, "%Y-%m-%d")
            duration = (end_date - start_date).days
            
            # Validate budget and calculate per-category budgets
            total_budget = request.budget_per_person * request.passengers
            category_budgets = self._calculate_category_budgets(total_budget, duration)
            
            normalized = {
                "origin": request.origin,
                "destination": request.destination,
                "destination_coords": destination_coords,
                "start_date": request.start_date,
                "end_date": request.end_date,
                "duration": duration,
                "passengers": request.passengers,
                "total_budget": total_budget,
                "category_budgets": category_budgets,
                "preferences": request.preferences.dict() if hasattr(request.preferences, 'dict') else request.preferences,
                "travel_style": request.travel_style,
                "special_requirements": request.special_requirements.dict() if hasattr(request.special_requirements, 'dict') else request.special_requirements
            }
            
            return normalized
            
        except Exception as e:
            logger.error(f"Request normalization failed: {e}")
            raise HTTPException(status_code=400, detail=f"Invalid request: {str(e)}")
    
    async def _search_flights(self, request: Dict[str, Any]) -> List[FlightOffer]:
        """Search for flights using multiple providers"""
        try:
            flight_offers = []

            # Normalize destination to airport code
            destination_code = self._normalize_destination(request["destination"])

            # Search with Amadeus
            if amadeus_client.client_id:
                amadeus_flights = await amadeus_client.search_flights(
                    origin=request["origin"],
                    destination=destination_code,  # Use normalized airport code
                    departure_date=request["start_date"],
                    return_date=request["end_date"],
                    adults=request["passengers"],
                    currency="MYR"
                )
                flight_offers.extend(amadeus_flights)
            
            # Search with Kiwi/Tequila
            if kiwi_client.api_key:
                kiwi_flights = await kiwi_client.search_flights(
                    origin=request["origin"],
                    destination=destination_code,  # Use normalized airport code
                    departure_date=request["start_date"],
                    return_date=request["end_date"],
                    adults=request["passengers"],
                    currency="MYR"
                )
                flight_offers.extend(kiwi_flights)
            
            # Search with Skyscanner
            if skyscanner_client.api_key:
                skyscanner_flights = await skyscanner_client.search_flights(
                    origin=request["origin"],
                    destination=request["destination"],
                    departure_date=request["start_date"],
                    return_date=request["end_date"],
                    adults=request["passengers"],
                    currency="MYR"
                )
                flight_offers.extend(skyscanner_flights)
            
            # Search with Google Travel (if available)
            if google_travel_client.api_key:
                google_flights = await google_travel_client.search_flights(
                    origin=request["origin"],
                    destination=request["destination"],
                    departure_date=request["start_date"],
                    return_date=request["end_date"],
                    adults=request["passengers"],
                    currency="MYR"
                )
                flight_offers.extend(google_flights)
            
            # Sort by price and filter by budget
            flight_budget = request["category_budgets"]["flights"]
            affordable_flights = [
                f for f in flight_offers 
                if f.get("total_price", 0) <= flight_budget
            ]
            
            # Sort by price and return top options
            affordable_flights.sort(key=lambda x: x.get("total_price", 0))
            return affordable_flights[:15]  # Top 15 options from all providers
            
        except Exception as e:
            logger.error(f"Flight search failed: {e}")
            return []
    
    async def _search_hotels(self, request: Dict[str, Any]) -> List[HotelOffer]:
        """Search for hotels using multiple providers"""
        try:
            hotel_offers = []

            # Normalize destination to city/airport code
            destination_code = self._normalize_destination(request["destination"])

            # Search with Amadeus
            if amadeus_client.client_id:
                amadeus_hotels = await amadeus_client.search_hotels(
                    city_code=destination_code,  # Use normalized code
                    check_in=request["start_date"],
                    check_out=request["end_date"],
                    adults=request["passengers"],
                    currency="MYR"
                )
                hotel_offers.extend(amadeus_hotels)
            
            # Search with Expedia
            if expedia_client.api_key:
                expedia_hotels = await expedia_client.search_hotels(
                    city=request["destination"],
                    check_in=request["start_date"],
                    check_out=request["end_date"],
                    adults=request["passengers"],
                    currency="MYR"
                )
                hotel_offers.extend(expedia_hotels)
            
            # Search with Google Travel
            if google_travel_client.api_key:
                google_hotels = await google_travel_client.search_hotels(
                    city=request["destination"],
                    check_in=request["start_date"],
                    check_out=request["end_date"],
                    adults=request["passengers"],
                    currency="MYR"
                )
                hotel_offers.extend(google_hotels)
            
            # Filter by budget and preferences
            hotel_budget = request["category_budgets"]["hotels"]
            affordable_hotels = [
                h for h in hotel_offers
                if float(h.get("price", 0)) <= hotel_budget
            ]
            
            # Sort by rating and return top options
            affordable_hotels.sort(key=lambda x: x.get("rating", 0), reverse=True)
            return affordable_hotels[:20]  # Top 20 options from all providers
            
        except Exception as e:
            logger.error(f"Hotel search failed: {e}")
            return []
    
    async def _search_activities(self, request: Dict[str, Any]) -> List[ActivityOffer]:
        """Search for activities and attractions using multiple providers"""
        try:
            if not request.get("destination_coords"):
                return []
            
            lat, lng = request["destination_coords"]
            activities = []
            
            # Search with Google Places
            if places_client.api_key:
                # Search for family attractions if family-friendly is requested
                if request.get("preferences", {}).get("family_friendly"):
                    family_attractions = await places_client.search_family_attractions(lat, lng)
                    activities.extend(family_attractions)
                
                # Search for halal restaurants if halal is requested
                if request.get("preferences", {}).get("halal_friendly"):
                    halal_restaurants = await places_client.search_halal_restaurants(lat, lng)
                    activities.extend(halal_restaurants)
                
                # Search for general attractions
                general_attractions = await places_client.search_nearby_places(
                    latitude=lat,
                    longitude=lng,
                    place_type="tourist_attraction",
                    radius=10000
                )
                activities.extend(general_attractions)
            
            # Search with TripAdvisor for additional insights
            if tripadvisor_client.api_key:
                # Search for locations in the destination
                tripadvisor_locations = await tripadvisor_client.search_locations(
                    query=request["destination"],
                    limit=15
                )
                
                # Convert TripAdvisor locations to activity format
                for location in tripadvisor_locations:
                    activity = {
                        "place_id": location.get("location_id", ""),
                        "name": location.get("name", ""),
                        "address": location.get("address", ""),
                        "rating": location.get("rating", 0),
                        "price_level": None,
                        "types": [location.get("category", "attraction")],
                        "photos": [],
                        "opening_hours": None,
                        "source": "tripadvisor"
                    }
                    activities.append(activity)
            
            # Remove duplicates and sort by rating
            unique_activities = {}
            for activity in activities:
                place_id = activity.get("place_id")
                if place_id not in unique_activities:
                    unique_activities[place_id] = activity
            
            sorted_activities = sorted(
                unique_activities.values(),
                key=lambda x: x.get("rating", 0),
                reverse=True
            )
            
            return sorted_activities[:30]  # Top 30 activities from all providers
            
        except Exception as e:
            logger.error(f"Activity search failed: {e}")
            return []
    
    async def _get_weather_data(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Get comprehensive weather, events, and travel data for the destination"""
        try:
            if not request.get("destination_coords"):
                return {}
            
            lat, lng = request["destination_coords"]
            weather_data = {}
            
            # Get weather data from OpenWeather/Open-Meteo
            from clients.weather_client import weather_client
            
            # Get current weather
            current_weather = await weather_client.get_current_weather(lat, lng)
            if current_weather:
                weather_data["current"] = current_weather
            
            # Get forecast for trip duration
            start_date = datetime.strptime(request["start_date"], "%Y-%m-%d")
            end_date = datetime.strptime(request["end_date"], "%Y-%m-%d")
            duration = (end_date - start_date).days
            
            forecast = await weather_client.get_forecast(lat, lng, max(duration, 7))
            if forecast:
                weather_data["forecast"] = forecast
            
            # Calculate comfort index for the target month
            target_month = start_date.month
            target_year = start_date.year
            comfort_index = await weather_client.calculate_comfort_index(lat, lng, target_month, target_year)
            if comfort_index is not None:
                weather_data["comfort_index"] = comfort_index
            
            # Get events data
            from clients.events_client import events_client
            
            events = await events_client.search_events_by_coordinates(
                latitude=lat,
                longitude=lng,
                radius_km=50,
                start_date=request["start_date"],
                end_date=request["end_date"],
                limit=10
            )
            if events:
                weather_data["events"] = events
            
            # Get seasonal events
            seasonal_events = await events_client.get_seasonal_events(
                city=request["destination"],
                month=target_month,
                year=target_year
            )
            if seasonal_events:
                weather_data["seasonal_events"] = seasonal_events
            
            # Get travel insights from Google Travel (if available)
            if google_travel_client and hasattr(google_travel_client, 'api_key') and google_travel_client.api_key:
                travel_insights = await google_travel_client.get_travel_insights(
                    destination=request["destination"],
                    travel_dates={
                        "start": request["start_date"],
                        "end": request["end_date"]
                    }
                )
                if travel_insights:
                    weather_data["travel_insights"] = travel_insights
            
            # Get trending destination data (if available)
            if tripadvisor_client and hasattr(tripadvisor_client, 'api_key') and tripadvisor_client.api_key:
                trending_data = await tripadvisor_client.get_trending_destinations()
                if trending_data:
                    weather_data["trending_insights"] = trending_data
            
            # Add destination coordinates
            weather_data["destination_coords"] = request["destination_coords"]
            
            # Add data freshness timestamp
            weather_data["last_updated"] = datetime.now().isoformat()
            
            # Log successful data retrieval
            logger.info(f"Weather and events data retrieved for {request['destination']}: {len(weather_data)} data points")
            
            return weather_data
            
        except Exception as e:
            logger.error(f"Weather and events data retrieval failed: {e}")
            return {
                "error": "Weather data unavailable",
                "last_updated": datetime.now().isoformat(),
                "destination_coords": request.get("destination_coords", (0, 0))
            }
    
    async def _generate_ai_itineraries(
        self,
        request: Dict[str, Any],
        flights: List[FlightOffer],
        hotels: List[HotelOffer],
        activities: List[ActivityOffer],
        weather: Dict[str, Any]
    ) -> List[TripOption]:
        """Generate AI-powered itinerary options using OpenAI/Claude"""
        try:
            # Import AI client
            from services.ai_client import ai_client
            
            # Generate AI-powered itinerary
            ai_response = await ai_client.generate_itinerary_recommendations(
                destination=request["destination"],
                budget=request["total_budget"],
                duration=request["duration"],
                preferences=request.get("preferences", {}),
                flight_options=flights,
                hotel_options=hotels,
                activity_options=activities,
                weather_data=weather
            )
            
            # Convert AI response to TripOption objects
            options = []
            for ai_option in ai_response.get("itinerary_options", []):
                trip_option = self._convert_ai_option_to_trip_option(ai_option, request)
                if trip_option:
                    options.append(trip_option)
            
            # If AI generation fails or returns no options, fallback to structured generation
            if not options:
                logger.warning("AI generated no options, falling back to structured generation")
                return await self._generate_structured_options(request, flights, hotels, activities, weather)
            
            return options
            
        except Exception as e:
            logger.error(f"AI itinerary generation failed: {e}")
            # Fallback to structured generation
            return await self._generate_structured_options(request, flights, hotels, activities, weather)
    
    def _convert_ai_option_to_trip_option(self, ai_option: Dict[str, Any], request: Dict[str, Any]) -> Optional[TripOption]:
        """Convert AI-generated option to TripOption object"""
        try:
            return TripOption(
                tier=ai_option.get("tier", "BUDGET"),
                title=ai_option.get("title", "AI Generated Itinerary"),
                description=ai_option.get("description", "Personalized travel experience"),
                flights=ai_option.get("selected_flight", {}),
                hotel=ai_option.get("selected_hotel", {}),
                activities=ai_option.get("included_activities", []),
                daily_itinerary=ai_option.get("daily_itinerary", []),
                total_cost=ai_option.get("total_cost", request["total_budget"]),
                currency=ai_option.get("currency", "MYR"),
                travel_tips=ai_option.get("travel_tips", []),
                packing_suggestions=ai_option.get("packing_suggestions", []),
                local_customs=ai_option.get("local_customs", []),
                emergency_info=ai_option.get("emergency_info", {}),
                ai_generated=True
            )
        except Exception as e:
            logger.error(f"Failed to convert AI option: {e}")
            return None
    
    async def _generate_structured_options(
        self,
        request: Dict[str, Any],
        flights: List[FlightOffer],
        hotels: List[HotelOffer],
        activities: List[ActivityOffer],
        weather: Dict[str, Any]
    ) -> List[TripOption]:
        """Generate structured options when AI is unavailable (fallback)"""
        options = []
        
        # Budget Option
        budget_option = await self._create_budget_option(
            request, flights, hotels, activities, weather
        )
        if budget_option:
            options.append(budget_option)
        
        # Comfort Option
        comfort_option = await self._create_comfort_option(
            request, flights, hotels, activities, weather
        )
        if comfort_option:
            options.append(comfort_option)
        
        # Luxury Option
        luxury_option = await self._create_luxury_option(
            request, flights, hotels, activities, weather
        )
        if luxury_option:
            options.append(luxury_option)
        
        return options
    
    async def _create_budget_option(
        self,
        request: Dict[str, Any],
        flights: List[FlightOffer],
        hotels: List[HotelOffer],
        activities: List[ActivityOffer],
        weather: Dict[str, Any]
    ) -> Optional[TripOption]:
        """Create budget-friendly trip option"""
        try:
            # Select cheapest flight
            if not flights:
                return None
            
            selected_flight = flights[0]  # Already sorted by price
            
            # Select affordable hotel
            if not hotels:
                return None
            
            # Filter hotels by budget and select best rated
            hotel_budget = request["category_budgets"]["hotels"]
            affordable_hotels = [h for h in hotels if h.get("price", 0) <= hotel_budget]
            if not affordable_hotels:
                return None
            
            selected_hotel = affordable_hotels[0]  # Already sorted by rating
            
            # Select free/cheap activities
            free_activities = [a for a in activities if a.get("price_level", 2) <= 1]
            selected_activities = free_activities[:3]  # Top 3 free activities
            
            # Calculate total cost
            flight_cost = selected_flight.get("total_price", 0)
            hotel_cost = selected_hotel.get("price", 0) * request["duration"]
            activity_cost = sum(a.get("price", 0) for a in selected_activities)
            total_cost = flight_cost + hotel_cost + activity_cost
            
            return TripOption(
                tier="BUDGET",
                flights=[selected_flight],
                hotel=selected_hotel,
                activities=selected_activities,
                total_cost=total_cost,
                currency="MYR",
                description="Affordable adventure with smart savings"
            )
            
        except Exception as e:
            logger.error(f"Budget option creation failed: {e}")
            return None
    
    async def _create_comfort_option(
        self,
        request: Dict[str, Any],
        flights: List[FlightOffer],
        hotels: List[HotelOffer],
        activities: List[ActivityOffer],
        weather: Dict[str, Any]
    ) -> Optional[TripOption]:
        """Create comfort-focused trip option"""
        try:
            # Select mid-range flight
            if len(flights) < 3:
                return None
            
            selected_flight = flights[2]  # Mid-range option
            
            # Select 3-4 star hotel
            if not hotels:
                return None
            
            # Filter for 3-4 star hotels
            comfort_hotels = [h for h in hotels if 3.0 <= h.get("rating", 0) <= 4.5]
            if not comfort_hotels:
                comfort_hotels = hotels[:5]  # Fallback to top 5
            
            selected_hotel = comfort_hotels[0]
            
            # Select mix of activities
            selected_activities = activities[:5]  # Top 5 activities
            
            # Calculate total cost
            flight_cost = selected_flight.get("total_price", 0)
            hotel_cost = selected_hotel.get("price", 0) * request["duration"]
            activity_cost = sum(a.get("price", 0) for a in selected_activities)
            total_cost = flight_cost + hotel_cost + activity_cost
            
            return TripOption(
                tier="COMFORT",
                flights=[selected_flight],
                hotel=selected_hotel,
                activities=selected_activities,
                total_cost=total_cost,
                currency="MYR",
                description="Balanced comfort and value for money"
            )
            
        except Exception as e:
            logger.error(f"Comfort option creation failed: {e}")
            return None
    
    async def _create_luxury_option(
        self,
        request: Dict[str, Any],
        flights: List[FlightOffer],
        hotels: List[HotelOffer],
        activities: List[ActivityOffer],
        weather: Dict[str, Any]
    ) -> Optional[TripOption]:
        """Create luxury-focused trip option"""
        try:
            # Select premium flight
            if len(flights) < 5:
                return None
            
            # Look for business class or premium options
            premium_flights = [f for f in flights if f.get("cabin_class") in ["BUSINESS", "FIRST"]]
            if premium_flights:
                selected_flight = premium_flights[0]
            else:
                selected_flight = flights[4]  # 5th option as fallback
            
            # Select luxury hotel
            if not hotels:
                return None
            
            # Filter for 4-5 star hotels
            luxury_hotels = [h for h in hotels if h.get("rating", 0) >= 4.5]
            if not luxury_hotels:
                luxury_hotels = hotels[:3]  # Fallback to top 3
            
            selected_hotel = luxury_hotels[0]
            
            # Select premium activities
            selected_activities = activities[:8]  # Top 8 activities
            
            # Calculate total cost
            flight_cost = selected_flight.get("total_price", 0)
            hotel_cost = selected_hotel.get("price", 0) * request["duration"]
            activity_cost = sum(a.get("price", 0) for a in selected_activities)
            total_cost = flight_cost + hotel_cost + activity_cost
            
            return TripOption(
                tier="LUXURY",
                flights=[selected_flight],
                hotel=selected_hotel,
                activities=selected_activities,
                total_cost=total_cost,
                currency="MYR",
                description="Premium experience with top-tier accommodations"
            )
            
        except Exception as e:
            logger.error(f"Luxury option creation failed: {e}")
            return None
    
    def _calculate_category_budgets(self, total_budget: float, duration: int) -> Dict[str, float]:
        """Calculate budget allocation across categories"""
        # Smart budget splitting based on trip duration
        if duration <= 3:  # Short trip
            return {
                "flights": total_budget * 0.45,
                "hotels": total_budget * 0.35,
                "activities": total_budget * 0.15,
                "buffer": total_budget * 0.05
            }
        elif duration <= 7:  # Medium trip
            return {
                "flights": total_budget * 0.40,
                "hotels": total_budget * 0.35,
                "activities": total_budget * 0.20,
                "buffer": total_budget * 0.05
            }
        else:  # Long trip
            return {
                "flights": total_budget * 0.35,
                "hotels": total_budget * 0.30,
                "activities": total_budget * 0.25,
                "buffer": total_budget * 0.10
            }
    
    async def _get_destination_coordinates(self, destination: str) -> Tuple[float, float]:
        """Get coordinates for destination (simplified - would use geocoding in production)"""
        # Simplified coordinate mapping for common destinations
        destination_coords = {
            "BKK": (13.7563, 100.5018),  # Bangkok
            "SIN": (1.3521, 103.8198),   # Singapore
            "TYO": (35.6762, 139.6503),  # Tokyo
            "KUL": (3.1390, 101.6869),   # Kuala Lumpur
            "HKG": (22.3193, 114.1694),  # Hong Kong
            "BALI": (-8.3405, 115.0920), # Bali
            "BANGKOK": (13.7563, 100.5018),
            "SINGAPORE": (1.3521, 103.8198),
            "TOKYO": (35.6762, 139.6503),
            "KUALA LUMPUR": (3.1390, 101.6869),
            "HONG KONG": (22.3193, 114.1694)
        }
        
        return destination_coords.get(destination.upper(), (0.0, 0.0))
    
    async def _finalize_itinerary(
        self,
        request: Dict[str, Any],
        options: List[TripOption],
        weather: Dict[str, Any]
    ) -> ItineraryResponse:
        """Finalize the complete itinerary response"""
        try:
            # Calculate emissions (simplified)
            total_emissions = self._calculate_emissions(request, options)
            
            # Create response
            response = ItineraryResponse(
                request_id=f"itinerary_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                title=f"{request['origin']} → {request['destination']} ({request['duration']} days)",
                budget={
                    "total": request["total_budget"],
                    "currency": "MYR",
                    "per_person": request["total_budget"] / request["passengers"]
                },
                emissions_kg=total_emissions,
                options=options,
                weather=weather,
                generated_at=datetime.now().isoformat(),
                source="ai_orchestrator"
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Itinerary finalization failed: {e}")
            raise HTTPException(status_code=500, detail=f"Itinerary finalization failed: {str(e)}")
    
    def _calculate_emissions(self, request: Dict[str, Any], options: List[TripOption]) -> float:
        """Calculate estimated carbon emissions for the trip"""
        try:
            # Simplified emission calculation
            # In production, this would use a proper carbon calculation API
            
            # Flight emissions (kg CO2 per passenger per km)
            # Assuming average distance and aircraft efficiency
            estimated_distance = 3000  # km (placeholder)
            flight_emissions_per_km = 0.15  # kg CO2 per passenger per km
            
            flight_emissions = estimated_distance * flight_emissions_per_km * request["passengers"]
            
            # Hotel emissions (kg CO2 per night per room)
            hotel_emissions_per_night = 15  # kg CO2 per night per room
            hotel_emissions = hotel_emissions_per_night * request["duration"]
            
            # Activity emissions (minimal)
            activity_emissions = 5 * len(options[0].activities) if options else 0
            
            total_emissions = flight_emissions + hotel_emissions + activity_emissions
            
            return round(total_emissions, 1)
            
        except Exception as e:
            logger.error(f"Emission calculation failed: {e}")
            return 0.0

# Global instance
ai_orchestrator = AIOrchestrator()
