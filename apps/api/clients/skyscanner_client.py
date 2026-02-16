"""
Skyscanner API Client - Flight Search & Price Tracking
https://www.partners.skyscanner.net/
"""

import os
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import httpx
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class SkyscannerClient:
    def __init__(self):
        self.api_key = os.getenv("SKYSCANNER_API_KEY")
        self.base_url = "https://partners.api.skyscanner.net/apiservices/v3"
        
        if not self.api_key:
            logger.warning("Skyscanner API key not configured")
    
    async def search_flights(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        return_date: Optional[str] = None,
        adults: int = 1,
        cabin_class: str = "economy",
        currency: str = "MYR"
    ) -> List[Dict[str, Any]]:
        """Search for flights using Skyscanner API"""
        if not self.api_key:
            return []
        
        try:
            headers = {
                "x-api-key": self.api_key,
                "Accept": "application/json"
            }
            
            params = {
                "originSkyId": origin,
                "destinationSkyId": destination,
                "date": departure_date,
                "returnDate": return_date,
                "adults": adults,
                "cabinClass": cabin_class,
                "currency": currency,
                "locale": "en-GB"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/flights/live/search/create",
                    headers=headers,
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                # Get search results
                search_id = data.get("sessionToken")
                if search_id:
                    return await self._get_search_results(search_id)
                
                return []
                
        except Exception as e:
            logger.error(f"Skyscanner flight search failed: {e}")
            return []
    
    async def _get_search_results(self, search_id: str) -> List[Dict[str, Any]]:
        """Get search results from Skyscanner"""
        try:
            headers = {
                "x-api-key": self.api_key,
                "Accept": "application/json"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/flights/live/search/poll/{search_id}",
                    headers=headers
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_flight_results(data)
                
        except Exception as e:
            logger.error(f"Skyscanner search results failed: {e}")
            return []
    
    async def get_cheapest_flights(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        return_date: Optional[str] = None,
        adults: int = 1
    ) -> List[Dict[str, Any]]:
        """Get cheapest flights for a route"""
        if not self.api_key:
            return []
        
        try:
            headers = {
                "x-api-key": self.api_key,
                "Accept": "application/json"
            }
            
            params = {
                "originSkyId": origin,
                "destinationSkyId": destination,
                "date": departure_date,
                "returnDate": return_date,
                "adults": adults,
                "currency": "MYR",
                "locale": "en-GB"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/flights/live/search/create",
                    headers=headers,
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                search_id = data.get("sessionToken")
                if search_id:
                    return await self._get_search_results(search_id)
                
                return []
                
        except Exception as e:
            logger.error(f"Skyscanner cheapest flights failed: {e}")
            return []
    
    async def get_route_prices(
        self,
        origin: str,
        destination: str,
        departure_date: str
    ) -> Dict[str, Any]:
        """Get price analysis for a route"""
        if not self.api_key:
            return {}
        
        try:
            headers = {
                "x-api-key": self.api_key,
                "Accept": "application/json"
            }
            
            params = {
                "originSkyId": origin,
                "destinationSkyId": destination,
                "date": departure_date,
                "currency": "MYR",
                "locale": "en-GB"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/flights/live/search/create",
                    headers=headers,
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                search_id = data.get("sessionToken")
                if search_id:
                    return await self._get_route_analysis(search_id)
                
                return {}
                
        except Exception as e:
            logger.error(f"Skyscanner route prices failed: {e}")
            return {}
    
    async def _get_route_analysis(self, search_id: str) -> Dict[str, Any]:
        """Get route price analysis"""
        try:
            headers = {
                "x-api-key": self.api_key,
                "Accept": "application/json"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/flights/live/search/poll/{search_id}",
                    headers=headers
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_route_analysis(data)
                
        except Exception as e:
            logger.error(f"Skyscanner route analysis failed: {e}")
            return {}
    
    async def get_airport_suggestions(self, query: str) -> List[Dict[str, Any]]:
        """Get airport suggestions for autocomplete"""
        if not self.api_key:
            return []
        
        try:
            headers = {
                "x-api-key": self.api_key,
                "Accept": "application/json"
            }
            
            params = {
                "query": query,
                "locale": "en-GB"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/autosuggest/flights",
                    headers=headers,
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_airport_suggestions(data.get("places", []))
                
        except Exception as e:
            logger.error(f"Skyscanner airport suggestions failed: {e}")
            return []
    
    def _parse_flight_results(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse Skyscanner flight results"""
        parsed_flights = []
        
        try:
            itineraries = data.get("itineraries", {})
            legs = data.get("legs", {})
            carriers = data.get("carriers", {})
            
            for itinerary_id, itinerary in itineraries.items():
                try:
                    # Get pricing
                    pricing_options = itinerary.get("pricingOptions", [])
                    if not pricing_options:
                        continue
                    
                    # Get the cheapest option
                    cheapest = min(pricing_options, key=lambda x: x.get("price", {}).get("amount", float('inf')))
                    price = cheapest.get("price", {})
                    
                    # Get legs
                    outbound_leg_id = itinerary.get("legIds", [None])[0]
                    inbound_leg_id = itinerary.get("legIds", [None])[1] if len(itinerary.get("legIds", [])) > 1 else None
                    
                    outbound_leg = legs.get(outbound_leg_id, {})
                    inbound_leg = legs.get(inbound_leg_id, {}) if inbound_leg_id else {}
                    
                    parsed_flight = {
                        "id": itinerary_id,
                        "provider": "skyscanner",
                        "total_price": price.get("amount", 0),
                        "currency": price.get("currency", "MYR"),
                        "cabin_class": "ECONOMY",  # Default
                        "outbound": self._parse_leg(outbound_leg, carriers),
                        "inbound": self._parse_leg(inbound_leg, carriers) if inbound_leg else [],
                        "booking_class": "ECONOMY",
                        "validating_airline": cheapest.get("agents", [{}])[0].get("name", ""),
                        "instant_ticketing": True,
                        "source": "skyscanner",
                        "deep_link": cheapest.get("items", [{}])[0].get("pricingOption", {}).get("url", "")
                    }
                    
                    parsed_flights.append(parsed_flight)
                    
                except Exception as e:
                    logger.error(f"Failed to parse itinerary: {e}")
                    continue
            
            return parsed_flights
            
        except Exception as e:
            logger.error(f"Failed to parse flight results: {e}")
            return []
    
    def _parse_leg(self, leg: Dict[str, Any], carriers: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse flight leg information"""
        if not leg:
            return []
        
        try:
            segments = leg.get("segments", [])
            parsed_segments = []
            
            for segment in segments:
                try:
                    parsed_segment = {
                        "departure": {
                            "airport": segment.get("origin", ""),
                            "time": segment.get("departure"),
                            "terminal": segment.get("departureTerminal", "")
                        },
                        "arrival": {
                            "airport": segment.get("destination", ""),
                            "time": segment.get("arrival"),
                            "terminal": segment.get("arrivalTerminal", "")
                        },
                        "carrier": carriers.get(segment.get("carrierId", ""), {}).get("name", ""),
                        "flight_number": segment.get("flightNumber", ""),
                        "aircraft": segment.get("aircraft", ""),
                        "duration": segment.get("durationInMinutes", 0),
                        "stops": 0
                    }
                    
                    parsed_segments.append(parsed_segment)
                    
                except Exception as e:
                    logger.error(f"Failed to parse segment: {e}")
                    continue
            
            return parsed_segments
            
        except Exception as e:
            logger.error(f"Failed to parse leg: {e}")
            return []
    
    def _parse_route_analysis(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse route price analysis"""
        try:
            itineraries = data.get("itineraries", {})
            pricing_options = []
            
            for itinerary_id, itinerary in itineraries.items():
                for pricing in itinerary.get("pricingOptions", []):
                    pricing_options.append({
                        "price": pricing.get("price", {}).get("amount", 0),
                        "currency": pricing.get("price", {}).get("currency", "MYR"),
                        "agent": pricing.get("agents", [{}])[0].get("name", "")
                    })
            
            if pricing_options:
                min_price = min(pricing_options, key=lambda x: x["price"])
                max_price = max(pricing_options, key=lambda x: x["price"])
                avg_price = sum(p["price"] for p in pricing_options) / len(pricing_options)
                
                return {
                    "min_price": min_price,
                    "max_price": max_price,
                    "average_price": round(avg_price, 2),
                    "total_options": len(pricing_options),
                    "source": "skyscanner"
                }
            
            return {}
            
        except Exception as e:
            logger.error(f"Failed to parse route analysis: {e}")
            return {}
    
    def _parse_airport_suggestions(self, places: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Parse airport suggestions"""
        parsed_suggestions = []
        
        for place in places:
            try:
                parsed_suggestion = {
                    "code": place.get("entityId", ""),
                    "name": place.get("name", ""),
                    "city": place.get("cityName", ""),
                    "country": place.get("countryName", ""),
                    "type": place.get("type", ""),
                    "source": "skyscanner"
                }
                
                parsed_suggestions.append(parsed_suggestion)
                
            except Exception as e:
                logger.error(f"Failed to parse airport suggestion: {e}")
                continue
        
        return parsed_suggestions

# Global instance
skyscanner_client = SkyscannerClient()
