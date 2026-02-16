"""
Itinerary Planning Routes
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import logging

from models.itinerary import ItineraryRequest, ItineraryResponse
from services.ai_orchestrator import ai_orchestrator

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/planning", tags=["planning"])

@router.post("/create", response_model=ItineraryResponse)
async def create_itinerary(request: ItineraryRequest):
    """
    Create a complete AI-generated itinerary
    
    This endpoint coordinates multiple travel APIs to create:
    - Flight options from multiple providers
    - Hotel recommendations based on preferences
    - Activity suggestions (halal-friendly, family-friendly, etc.)
    - Weather data and local insights
    - Three tiered options: Budget, Comfort, and Luxury
    """
    try:
        logger.info(f"Creating itinerary for {request.origin} → {request.destination}")
        
        # Validate request dates
        from datetime import datetime
        start_date = datetime.strptime(request.start_date, "%Y-%m-%d")
        end_date = datetime.strptime(request.end_date, "%Y-%m-%d")
        
        if start_date >= end_date:
            raise HTTPException(status_code=400, detail="End date must be after start date")
        
        if start_date.date() < datetime.now().date():
            raise HTTPException(status_code=400, detail="Start date cannot be in the past")
        
        # Create itinerary using AI orchestrator
        itinerary = await ai_orchestrator.create_itinerary(request)
        
        logger.info(f"Successfully created itinerary {itinerary.request_id}")
        return itinerary
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Itinerary creation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to create itinerary")

@router.get("/destinations/suggest")
async def suggest_destinations(
    budget: float,
    currency: str = "MYR",
    month: Optional[str] = None,
    preferences: Optional[str] = None
):
    """
    Get destination suggestions based on budget and preferences
    
    This endpoint provides intelligent destination recommendations
    considering weather, events, and travel trends.
    """
    try:
        # Parse preferences
        parsed_preferences = {}
        if preferences:
            try:
                parsed_preferences = eval(preferences)  # In production, use proper parsing
            except:
                parsed_preferences = {}
        
        # Get destination suggestions based on budget
        suggestions = await _get_destination_suggestions(
            budget=budget,
            currency=currency,
            month=month,
            preferences=parsed_preferences
        )
        
        return {
            "budget": budget,
            "currency": currency,
            "month": month,
            "suggestions": suggestions
        }
        
    except Exception as e:
        logger.error(f"Destination suggestions failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to get destination suggestions")

@router.get("/flights/search")
async def search_flights(
    origin: str,
    destination: str,
    departure_date: str,
    return_date: Optional[str] = None,
    adults: int = 1,
    cabin_class: str = "ECONOMY",
    currency: str = "MYR"
):
    """
    Search for flights using multiple providers
    
    Aggregates results from Amadeus and Kiwi/Tequila APIs
    to provide comprehensive flight options.
    """
    try:
        from clients import (
            amadeus_client, kiwi_client, skyscanner_client,
            google_travel_client, expedia_client
        )
        
        flight_offers = []
        
        # Search with Amadeus
        if amadeus_client.client_id:
            amadeus_flights = await amadeus_client.search_flights(
                origin=origin,
                destination=destination,
                departure_date=departure_date,
                return_date=return_date,
                adults=adults,
                cabin_class=cabin_class,
                currency=currency
            )
            flight_offers.extend(amadeus_flights)
        
                    # Search with Kiwi/Tequila
            if kiwi_client.api_key:
                kiwi_flights = await kiwi_client.search_flights(
                    origin=origin,
                    destination=destination,
                    departure_date=departure_date,
                    return_date=return_date,
                    adults=adults,
                    cabin_class=cabin_class,
                    currency=currency
                )
                flight_offers.extend(kiwi_flights)
            
            # Search with Skyscanner
            if skyscanner_client.api_key:
                skyscanner_flights = await skyscanner_client.search_flights(
                    origin=origin,
                    destination=destination,
                    departure_date=departure_date,
                    return_date=return_date,
                    adults=adults,
                    cabin_class=cabin_class,
                    currency=currency
                )
                flight_offers.extend(skyscanner_flights)
            
            # Search with Google Travel
            if google_travel_client.api_key:
                google_flights = await google_travel_client.search_flights(
                    origin=origin,
                    destination=destination,
                    departure_date=departure_date,
                    return_date=return_date,
                    adults=adults,
                    cabin_class=cabin_class,
                    currency=currency
                )
                flight_offers.extend(google_flights)
            
            # Remove duplicates and sort by price
            unique_flights = {}
            for flight in flight_offers:
                flight_id = flight.get("id")
                if flight_id not in unique_flights:
                    unique_flights[flight_id] = flight
            
            sorted_flights = sorted(
                unique_flights.values(),
                key=lambda x: x.get("total_price", 0)
            )
            
            return {
                "origin": origin,
                "destination": destination,
                "departure_date": departure_date,
                "return_date": return_date,
                "adults": adults,
                "cabin_class": cabin_class,
                "currency": currency,
                "total_results": len(sorted_flights),
                "flights": sorted_flights[:30]  # Return top 30 from all providers
            }
        
    except Exception as e:
        logger.error(f"Flight search failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to search flights")

@router.get("/hotels/search")
async def search_hotels(
    city: str,
    check_in: str,
    check_out: str,
    adults: int = 1,
    currency: str = "MYR"
):
    """
    Search for hotels in a specific city
    
    Uses Amadeus API to find hotel options with detailed information.
    """
    try:
        from clients import amadeus_client, expedia_client, google_travel_client
        
        hotel_offers = []
        
        # Search with Amadeus
        if amadeus_client.client_id:
            amadeus_hotels = await amadeus_client.search_hotels(
                city_code=city,
                check_in=check_in,
                check_out=check_out,
                adults=adults,
                currency=currency
            )
            hotel_offers.extend(amadeus_hotels)
        
        # Search with Expedia
        if expedia_client.api_key:
            expedia_hotels = await expedia_client.search_hotels(
                city=city,
                check_in=check_in,
                check_out=check_out,
                adults=adults,
                currency=currency
            )
            hotel_offers.extend(expedia_hotels)
        
        # Search with Google Travel
        if google_travel_client.api_key:
            google_hotels = await google_travel_client.search_hotels(
                city=city,
                check_in=check_in,
                check_out=check_out,
                adults=adults,
                currency=currency
            )
            hotel_offers.extend(google_hotels)
        
        if not hotel_offers:
            raise HTTPException(status_code=503, detail="No hotel search services available")
        
        # Remove duplicates and sort by rating
        unique_hotels = {}
        for hotel in hotel_offers:
            hotel_id = hotel.get("id")
            if hotel_id not in unique_hotels:
                unique_hotels[hotel_id] = hotel
        
        sorted_hotels = sorted(
            unique_hotels.values(),
            key=lambda x: x.get("rating", 0),
            reverse=True
        )
        
        return {
            "city": city,
            "check_in": check_in,
            "check_out": check_out,
            "adults": adults,
            "currency": currency,
            "total_results": len(sorted_hotels),
            "hotels": sorted_hotels[:25]  # Return top 25 from all providers
        }
        
    except Exception as e:
        logger.error(f"Hotel search failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to search hotels")

@router.get("/activities/search")
async def search_activities(
    latitude: float,
    longitude: float,
    radius: int = 5000,
    place_type: str = "tourist_attraction",
    halal_friendly: bool = False,
    family_friendly: bool = False
):
    """
    Search for activities and attractions near a location
    
    Uses Google Places API to find points of interest,
    with special filtering for halal and family-friendly options.
    """
    try:
        from clients import places_client, tripadvisor_client
        
        activities = []
        
        # Search with Google Places
        if places_client.api_key:
            # Search for general attractions
            general_activities = await places_client.search_nearby_places(
                latitude=latitude,
                longitude=longitude,
                radius=radius,
                place_type=place_type
            )
            activities.extend(general_activities)
            
            # Add specialized searches if requested
            if halal_friendly:
                halal_restaurants = await places_client.search_halal_restaurants(
                    latitude=latitude,
                    longitude=longitude,
                    radius=radius
                )
                activities.extend(halal_restaurants)
            
            if family_friendly:
                family_attractions = await places_client.search_family_attractions(
                    latitude=latitude,
                    longitude=longitude,
                    radius=radius
                )
                activities.extend(family_attractions)
        
        # Search with TripAdvisor for additional insights
        if tripadvisor_client.api_key:
            # Search for locations in the area
            tripadvisor_locations = await tripadvisor_client.search_locations(
                query=f"attractions near {latitude},{longitude}",
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
        
        if not activities:
            raise HTTPException(status_code=503, detail="No activity search services available")
        
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
        
        return {
            "latitude": latitude,
            "longitude": longitude,
            "radius": radius,
            "place_type": place_type,
            "halal_friendly": halal_friendly,
            "family_friendly": family_friendly,
            "total_results": len(sorted_activities),
            "activities": sorted_activities[:35]  # Return top 35 from all providers
        }
        
    except Exception as e:
        logger.error(f"Activity search failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to search activities")

async def _get_destination_suggestions(
    budget: float,
    currency: str,
    month: Optional[str],
    preferences: dict
) -> List[dict]:
    """Get destination suggestions based on budget and preferences"""
    try:
        # Simplified destination suggestions
        # In production, this would use real-time pricing data
        
        common_destinations = [
            {
                "code": "BKK",
                "name": "Bangkok, Thailand",
                "estimated_cost": budget * 0.8,
                "weather_score": 0.85,
                "halal_score": 0.9,
                "family_score": 0.8,
                "highlights": ["Temples", "Street Food", "Shopping", "Culture"]
            },
            {
                "code": "SIN",
                "name": "Singapore",
                "estimated_cost": budget * 1.2,
                "weather_score": 0.75,
                "halal_score": 0.95,
                "family_score": 0.9,
                "highlights": ["Gardens by the Bay", "Sentosa Island", "Food", "Clean City"]
            },
            {
                "code": "TYO",
                "name": "Tokyo, Japan",
                "estimated_cost": budget * 1.5,
                "weather_score": 0.8,
                "halal_score": 0.6,
                "family_score": 0.85,
                "highlights": ["Technology", "Culture", "Food", "Shopping"]
            },
            {
                "code": "BALI",
                "name": "Bali, Indonesia",
                "estimated_cost": budget * 0.7,
                "weather_score": 0.9,
                "halal_score": 0.95,
                "family_score": 0.75,
                "highlights": ["Beaches", "Temples", "Nature", "Culture"]
            }
        ]
        
        # Filter by budget
        affordable_destinations = [
            d for d in common_destinations 
            if d["estimated_cost"] <= budget
        ]
        
        # Sort by overall score
        for dest in affordable_destinations:
            overall_score = (
                dest["weather_score"] * 0.3 +
                dest["halal_score"] * 0.3 +
                dest["family_score"] * 0.4
            )
            dest["overall_score"] = round(overall_score, 2)
        
        affordable_destinations.sort(key=lambda x: x["overall_score"], reverse=True)
        
        return affordable_destinations[:5]  # Return top 5
        
    except Exception as e:
        logger.error(f"Destination suggestions failed: {e}")
        return []
