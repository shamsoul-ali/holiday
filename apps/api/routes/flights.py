"""
Flight Search API Routes
Provides flight search functionality using Amadeus and other providers
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import logging

from clients import amadeus_client, kiwi_client, skyscanner_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/flights", tags=["flights"])


@router.get("/search")
async def search_flights(
    origin: str = Query(..., description="Origin airport code (IATA)"),
    destination: str = Query(..., description="Destination airport code (IATA)"),
    departure_date: str = Query(..., description="Departure date (YYYY-MM-DD)"),
    return_date: Optional[str] = Query(None, description="Return date (YYYY-MM-DD)"),
    adults: int = Query(1, ge=1, le=9, description="Number of adult passengers"),
    cabin_class: str = Query("ECONOMY", description="Cabin class"),
    currency: str = Query("MYR", description="Currency code"),
):
    """
    Search for flights using multiple providers
    Returns flight offers from Amadeus, Kiwi, Skyscanner (if configured)
    """
    try:
        all_flights = []

        # Search with Amadeus
        if amadeus_client.client_id:
            try:
                logger.info(f"Searching Amadeus flights: {origin} → {destination}")
                amadeus_flights = await amadeus_client.search_flights(
                    origin=origin,
                    destination=destination,
                    departure_date=departure_date,
                    return_date=return_date,
                    adults=adults,
                    cabin_class=cabin_class,
                    currency=currency
                )
                all_flights.extend(amadeus_flights)
                logger.info(f"Found {len(amadeus_flights)} flights from Amadeus")
            except Exception as e:
                logger.error(f"Amadeus flight search failed: {e}")

        # Search with Kiwi
        if kiwi_client.api_key:
            try:
                logger.info(f"Searching Kiwi flights: {origin} → {destination}")
                kiwi_flights = await kiwi_client.search_flights(
                    origin=origin,
                    destination=destination,
                    departure_date=departure_date,
                    return_date=return_date,
                    adults=adults,
                    currency=currency
                )
                all_flights.extend(kiwi_flights)
                logger.info(f"Found {len(kiwi_flights)} flights from Kiwi")
            except Exception as e:
                logger.error(f"Kiwi flight search failed: {e}")

        # Search with Skyscanner
        if skyscanner_client.api_key:
            try:
                logger.info(f"Searching Skyscanner flights: {origin} → {destination}")
                skyscanner_flights = await skyscanner_client.search_flights(
                    origin=origin,
                    destination=destination,
                    departure_date=departure_date,
                    return_date=return_date,
                    adults=adults,
                    currency=currency
                )
                all_flights.extend(skyscanner_flights)
                logger.info(f"Found {len(skyscanner_flights)} flights from Skyscanner")
            except Exception as e:
                logger.error(f"Skyscanner flight search failed: {e}")

        # Sort by price
        all_flights.sort(key=lambda x: float(x.get("total_price", 999999)))

        return {
            "success": True,
            "flights": all_flights[:50],  # Limit to top 50
            "total_results": len(all_flights),
            "providers": {
                "amadeus": bool(amadeus_client.client_id),
                "kiwi": bool(kiwi_client.api_key),
                "skyscanner": bool(skyscanner_client.api_key)
            }
        }

    except Exception as e:
        logger.error(f"Flight search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
