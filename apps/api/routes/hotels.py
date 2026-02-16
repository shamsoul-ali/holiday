"""
Hotel Search API Routes
Provides hotel search functionality using Amadeus, Google Places, and other providers
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import logging

from clients import amadeus_client, places_client, expedia_client, google_travel_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/hotels", tags=["hotels"])


@router.get("/search")
async def search_hotels(
    destination: str = Query(..., description="Destination city or code"),
    check_in: str = Query(..., description="Check-in date (YYYY-MM-DD)"),
    check_out: str = Query(..., description="Check-out date (YYYY-MM-DD)"),
    adults: int = Query(2, ge=1, le=8, description="Number of adults"),
    currency: str = Query("MYR", description="Currency code"),
):
    """
    Search for hotels using multiple providers
    Returns hotel offers from Amadeus, Google Places, Expedia (if configured)
    """
    try:
        all_hotels = []

        # Normalize destination to city code if needed
        from services.ai_orchestrator import AIOrchestrator
        orchestrator = AIOrchestrator()
        destination_code = orchestrator._normalize_destination(destination)

        # Search with Amadeus
        if amadeus_client.client_id:
            try:
                logger.info(f"Searching Amadeus hotels in {destination_code}")
                amadeus_hotels = await amadeus_client.search_hotels(
                    city_code=destination_code,
                    check_in=check_in,
                    check_out=check_out,
                    adults=adults,
                    currency=currency
                )
                all_hotels.extend(amadeus_hotels)
                logger.info(f"Found {len(amadeus_hotels)} hotels from Amadeus")
            except Exception as e:
                logger.error(f"Amadeus hotel search failed: {e}")

        # Search with Google Places
        if places_client.api_key:
            try:
                logger.info(f"Searching Google Places hotels in {destination}")
                # Get city coordinates (simplified - you may want to use geocoding)
                coords = {
                    "tokyo": (35.6762, 139.6503),
                    "paris": (48.8566, 2.3522),
                    "london": (51.5074, -0.1278),
                    "singapore": (1.3521, 103.8198),
                    "new york": (40.7128, -74.0060),
                }.get(destination.lower())

                if coords:
                    lat, lng = coords
                    google_hotels = await places_client.search_nearby_places(
                        latitude=lat,
                        longitude=lng,
                        radius=25000,  # 25km
                        place_type="lodging"
                    )
                    # Transform Google Places format to match hotel schema
                    for place in google_hotels[:15]:  # Limit to 15
                        all_hotels.append({
                            "hotel_id": place.get("place_id"),
                            "name": place.get("name"),
                            "rating": place.get("rating", 0),
                            "address": place.get("vicinity", ""),
                            "price": None,  # Google Places doesn't provide pricing
                            "currency": currency,
                            "check_in": check_in,
                            "check_out": check_out,
                            "source": "google_places"
                        })
                    logger.info(f"Found {len(google_hotels)} hotels from Google Places")
            except Exception as e:
                logger.error(f"Google Places hotel search failed: {e}")

        # Search with Expedia
        if expedia_client.api_key:
            try:
                logger.info(f"Searching Expedia hotels in {destination}")
                expedia_hotels = await expedia_client.search_hotels(
                    city=destination,
                    check_in=check_in,
                    check_out=check_out,
                    adults=adults,
                    currency=currency
                )
                all_hotels.extend(expedia_hotels)
                logger.info(f"Found {len(expedia_hotels)} hotels from Expedia")
            except Exception as e:
                logger.error(f"Expedia hotel search failed: {e}")

        # Search with Google Travel (uses Google Places API)
        if google_travel_client.api_key or google_travel_client.places_key:
            try:
                logger.info(f"Searching Google Travel/Places hotels in {destination}")
                google_travel_hotels = await google_travel_client.search_hotels(
                    city=destination,
                    check_in=check_in,
                    check_out=check_out,
                    adults=adults,
                    currency=currency
                )
                all_hotels.extend(google_travel_hotels)
                logger.info(f"Found {len(google_travel_hotels)} hotels from Google Travel/Places")
            except Exception as e:
                logger.error(f"Google Travel hotel search failed: {e}")

        # Sort by rating (hotels with price first, then by rating)
        hotels_with_price = [h for h in all_hotels if h.get("price")]
        hotels_without_price = [h for h in all_hotels if not h.get("price")]

        hotels_with_price.sort(key=lambda x: float(x.get("price", 999999)))
        hotels_without_price.sort(key=lambda x: float(x.get("rating", 0)), reverse=True)

        sorted_hotels = hotels_with_price + hotels_without_price

        return {
            "success": True,
            "hotels": sorted_hotels[:50],  # Limit to top 50
            "total_results": len(sorted_hotels),
            "providers": {
                "amadeus": bool(amadeus_client.client_id),
                "google_places": bool(places_client.api_key),
                "expedia": bool(expedia_client.api_key),
                "google_travel": bool(google_travel_client.api_key or google_travel_client.places_key)
            }
        }

    except Exception as e:
        logger.error(f"Hotel search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
