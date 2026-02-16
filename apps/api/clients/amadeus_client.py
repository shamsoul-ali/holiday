"""
Amadeus API Client for flights and hotels
https://developers.amadeus.com/
"""

import os
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import httpx
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class AmadeusClient:
    def __init__(self):
        self.client_id = os.getenv("AMADEUS_CLIENT_ID")
        self.client_secret = os.getenv("AMADEUS_CLIENT_SECRET")
        self.base_url = "https://test.api.amadeus.com/v2"  # Use test for development
        self.access_token = None
        self.token_expires_at = None
        
        if not self.client_id or not self.client_secret:
            logger.warning("Amadeus credentials not configured")
    
    async def _get_access_token(self) -> str:
        """Get or refresh access token"""
        if (self.access_token and self.token_expires_at and 
            datetime.now() < self.token_expires_at):
            return self.access_token
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://test.api.amadeus.com/v1/security/oauth2/token",
                    data={
                        "grant_type": "client_credentials",
                        "client_id": self.client_id,
                        "client_secret": self.client_secret
                    },
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )
                response.raise_for_status()
                token_data = response.json()
                
                self.access_token = token_data["access_token"]
                self.token_expires_at = datetime.now() + timedelta(seconds=token_data["expires_in"] - 300)  # 5 min buffer
                
                return self.access_token
                
        except Exception as e:
            logger.error(f"Failed to get Amadeus access token: {e}")
            raise HTTPException(status_code=500, detail="Amadeus authentication failed")
    
    async def search_flights(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        return_date: Optional[str] = None,
        adults: int = 1,
        cabin_class: str = "ECONOMY",
        currency: str = "MYR"
    ) -> List[Dict[str, Any]]:
        """Search for flights using Amadeus Flight Offers Search API"""
        if not self.client_id:
            logger.warning("Amadeus client_id not configured, skipping flight search")
            return []

        try:
            token = await self._get_access_token()

            params = {
                "originLocationCode": origin,
                "destinationLocationCode": destination,
                "departureDate": departure_date,
                "adults": adults,
                "travelClass": cabin_class,
                "currencyCode": currency,
                "max": 50,  # Maximum results
                "nonStop": False
            }

            if return_date:
                params["returnDate"] = return_date

            logger.info(f"Searching Amadeus flights: {origin} -> {destination} on {departure_date}")

            timeout = httpx.Timeout(30.0, connect=10.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.get(
                    f"{self.base_url}/shopping/flight-offers",
                    params=params,
                    headers={"Authorization": f"Bearer {token}"}
                )
                response.raise_for_status()
                data = response.json()

                flights = self._parse_flight_offers(data.get("data", []))
                logger.info(f"Found {len(flights)} flight offers from Amadeus")
                return flights

        except httpx.HTTPStatusError as e:
            logger.error(f"Amadeus flight search HTTP error: {e.response.status_code} - {e.response.text}")
            return []
        except Exception as e:
            logger.error(f"Amadeus flight search failed: {type(e).__name__}: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return []
    
    async def search_hotels(
        self,
        city_code: str,
        check_in: str,
        check_out: str,
        adults: int = 1,
        currency: str = "MYR"
    ) -> List[Dict[str, Any]]:
        """
        Search for hotels using Amadeus Hotel Search API (2-step process)
        Step 1: Get hotel list by city
        Step 2: Get hotel offers with pricing
        """
        if not self.client_id:
            return []

        try:
            token = await self._get_access_token()
            timeout = httpx.Timeout(30.0, connect=10.0)

            # Step 1: Get hotel IDs by city
            logger.info(f"Searching Amadeus hotels in {city_code}")

            async with httpx.AsyncClient(timeout=timeout) as client:
                # Get hotel list
                list_response = await client.get(
                    f"{self.base_url.replace('/v2', '/v1')}/reference-data/locations/hotels/by-city",
                    params={"cityCode": city_code},
                    headers={"Authorization": f"Bearer {token}"}
                )
                list_response.raise_for_status()
                list_data = list_response.json()

                hotel_ids = [h["hotelId"] for h in list_data.get("data", [])[:10]]  # Limit to 10

                if not hotel_ids:
                    logger.warning(f"No hotels found in {city_code}")
                    return []

                # Step 2: Get hotel offers with pricing
                offers_response = await client.get(
                    f"{self.base_url.replace('/v2', '/v3')}/shopping/hotel-offers",
                    params={
                        "hotelIds": ",".join(hotel_ids),
                        "checkInDate": check_in,
                        "checkOutDate": check_out,
                        "adults": adults,
                        "currency": currency,
                        "bestRateOnly": "true"
                    },
                    headers={"Authorization": f"Bearer {token}"}
                )
                offers_response.raise_for_status()
                offers_data = offers_response.json()

                # Parse hotel offers
                hotels = []
                for offer in offers_data.get("data", []):
                    hotel_data = offer.get("hotel", {})
                    best_offer = offer.get("offers", [{}])[0]

                    hotels.append({
                        "hotel_id": hotel_data.get("hotelId"),
                        "name": hotel_data.get("name", "Unknown Hotel"),
                        "rating": hotel_data.get("rating"),
                        "price": best_offer.get("price", {}).get("total"),
                        "currency": best_offer.get("price", {}).get("currency", currency),
                        "check_in": check_in,
                        "check_out": check_out,
                        "address": hotel_data.get("address", {}).get("lines", [""])[0] if hotel_data.get("address") else "",
                        "source": "amadeus"
                    })

                logger.info(f"Found {len(hotels)} hotel offers from Amadeus")
                return hotels

        except httpx.HTTPStatusError as e:
            logger.error(f"Amadeus hotel search HTTP error: {e.response.status_code} - {e.response.text[:200]}")
            return []
        except Exception as e:
            logger.error(f"Amadeus hotel search failed: {type(e).__name__}: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return []
    
    async def _get_hotel_detail(self, hotel_id: str, token: str) -> Optional[Dict[str, Any]]:
        """Get detailed hotel information"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/reference-data/locations/hotels/{hotel_id}",
                    headers={"Authorization": f"Bearer {token}"}
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Failed to get hotel detail: {e}")
            return None
    
    def _parse_flight_offers(self, offers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Parse and standardize flight offers"""
        parsed_offers = []
        
        for offer in offers:
            try:
                # Extract pricing
                total_price = offer.get("price", {}).get("total", "0")
                currency = offer.get("price", {}).get("currency", "EUR")
                
                # Extract itinerary
                itineraries = offer.get("itineraries", [])
                if not itineraries:
                    continue
                
                outbound = itineraries[0].get("segments", [])
                inbound = itineraries[1].get("segments", []) if len(itineraries) > 1 else []
                
                parsed_offer = {
                    "id": offer.get("id"),
                    "provider": "amadeus",
                    "total_price": float(total_price),
                    "currency": currency,
                    "cabin_class": offer.get("travelerPricings", [{}])[0].get("fareDetailsBySegment", [{}])[0].get("cabin", "ECONOMY"),
                    "outbound": self._parse_segments(outbound),
                    "inbound": self._parse_segments(inbound),
                    "booking_class": offer.get("class", "ECONOMY"),
                    "validating_airline": offer.get("validatingAirlineCodes", [""])[0],
                    "instant_ticketing": offer.get("instantTicketingRequired", False),
                    "source": "amadeus"
                }
                
                parsed_offers.append(parsed_offer)
                
            except Exception as e:
                logger.error(f"Failed to parse flight offer: {e}")
                continue
        
        return parsed_offers
    
    def _parse_segments(self, segments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Parse flight segments"""
        parsed_segments = []
        
        for segment in segments:
            try:
                parsed_segment = {
                    "departure": {
                        "airport": segment.get("departure", {}).get("iataCode"),
                        "time": segment.get("departure", {}).get("at"),
                        "terminal": segment.get("departure", {}).get("terminal")
                    },
                    "arrival": {
                        "airport": segment.get("arrival", {}).get("iataCode"),
                        "time": segment.get("arrival", {}).get("at"),
                        "terminal": segment.get("arrival", {}).get("terminal")
                    },
                    "carrier": segment.get("carrierCode"),
                    "flight_number": segment.get("number"),
                    "aircraft": segment.get("aircraft", {}).get("code"),
                    "duration": segment.get("duration"),
                    "stops": segment.get("numberOfStops", 0)
                }
                
                parsed_segments.append(parsed_segment)
                
            except Exception as e:
                logger.error(f"Failed to parse segment: {e}")
                continue
        
        return parsed_segments
    
    async def get_airport_info(self, airport_code: str) -> Optional[Dict[str, Any]]:
        """Get airport information"""
        if not self.client_id:
            return None
        
        try:
            token = await self._get_access_token()
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/reference-data/locations/{airport_code}",
                    headers={"Authorization": f"Bearer {token}"}
                )
                response.raise_for_status()
                return response.json()
                
        except Exception as e:
            logger.error(f"Failed to get airport info: {e}")
            return None

# Global instance
amadeus_client = AmadeusClient()
