"""
Kiwi/Tequila API Client for flights
https://tequila.kiwi.com/
"""

import os
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import httpx
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class KiwiClient:
    def __init__(self):
        self.api_key = os.getenv("KIWI_TEQUILA_KEY")
        self.base_url = "https://tequila-api.kiwi.com"
        
        if not self.api_key:
            logger.warning("Kiwi/Tequila API key not configured")
    
    async def search_flights(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        return_date: Optional[str] = None,
        adults: int = 1,
        cabin_class: str = "M",  # M = Economy, W = Premium Economy, C = Business
        currency: str = "MYR",
        max_stops: int = 2
    ) -> List[Dict[str, Any]]:
        """Search for flights using Kiwi/Tequila API"""
        if not self.api_key:
            return []
        
        try:
            params = {
                "fly_from": origin,
                "fly_to": destination,
                "date_from": departure_date,
                "date_to": departure_date,
                "adults": adults,
                "curr": currency,
                "locale": "en",
                "max_stopovers": max_stops,
                "ret_from_diff_city": False,
                "ret_to_diff_city": False,
                "select_airlines": "",
                "select_airlines_exclude": "",
                "price_from": 0,
                "price_to": 10000,
                "sort": "price",  # Sort by price
                "limit": 50
            }
            
            if return_date:
                params["return_from"] = return_date
                params["return_to"] = return_date
            
            # Map cabin class
            cabin_mapping = {
                "ECONOMY": "M",
                "PREMIUM_ECONOMY": "W", 
                "BUSINESS": "C",
                "FIRST": "F"
            }
            params["selected_cabins"] = cabin_mapping.get(cabin_class, "M")
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/v2/search",
                    params=params,
                    headers={"apikey": self.api_key}
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_flight_offers(data.get("data", []))
                
        except Exception as e:
            logger.error(f"Kiwi flight search failed: {e}")
            return []
    
    async def search_cheapest_flights(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        return_date: Optional[str] = None,
        adults: int = 1,
        currency: str = "MYR"
    ) -> List[Dict[str, Any]]:
        """Search for cheapest flights using Kiwi/Tequila Cheapest API"""
        if not self.api_key:
            return []
        
        try:
            params = {
                "fly_from": origin,
                "fly_to": destination,
                "date_from": departure_date,
                "date_to": departure_date,
                "adults": adults,
                "curr": currency,
                "locale": "en",
                "max_stopovers": 2,
                "ret_from_diff_city": False,
                "ret_to_diff_city": False,
                "sort": "price",
                "limit": 20
            }
            
            if return_date:
                params["return_from"] = return_date
                params["return_to"] = return_date
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/v2/search",
                    params=params,
                    headers={"apikey": self.api_key}
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_flight_offers(data.get("data", []))
                
        except Exception as e:
            logger.error(f"Kiwi cheapest flight search failed: {e}")
            return []
    
    async def get_airport_suggestions(self, query: str) -> List[Dict[str, Any]]:
        """Get airport suggestions for autocomplete"""
        if not self.api_key:
            return []
        
        try:
            params = {
                "term": query,
                "locale": "en",
                "location_types": "airport",
                "limit": 10
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/locations/query",
                    params=params,
                    headers={"apikey": self.api_key}
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_airport_suggestions(data.get("locations", []))
                
        except Exception as e:
            logger.error(f"Kiwi airport suggestions failed: {e}")
            return []
    
    def _parse_flight_offers(self, offers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Parse and standardize flight offers"""
        parsed_offers = []
        
        for offer in offers:
            try:
                # Extract pricing
                total_price = offer.get("price", 0)
                currency = offer.get("currency", "EUR")
                
                # Extract routes
                routes = offer.get("route", [])
                if not routes:
                    continue
                
                # Separate outbound and inbound
                outbound = [r for r in routes if r.get("return") == 0]
                inbound = [r for r in routes if r.get("return") == 1]
                
                parsed_offer = {
                    "id": offer.get("id"),
                    "provider": "kiwi",
                    "total_price": float(total_price),
                    "currency": currency,
                    "cabin_class": self._map_cabin_class(offer.get("fare_category", "M")),
                    "outbound": self._parse_routes(outbound),
                    "inbound": self._parse_routes(inbound),
                    "booking_class": offer.get("fare_category", "M"),
                    "validating_airline": offer.get("airlines", [""])[0] if offer.get("airlines") else "",
                    "instant_ticketing": True,  # Kiwi offers are usually instant
                    "source": "kiwi",
                    "deep_link": offer.get("deep_link", ""),
                    "duration": {
                        "outbound": offer.get("duration", {}).get("departure", 0),
                        "return": offer.get("duration", {}).get("return", 0)
                    }
                }
                
                parsed_offers.append(parsed_offer)
                
            except Exception as e:
                logger.error(f"Failed to parse Kiwi flight offer: {e}")
                continue
        
        return parsed_offers
    
    def _parse_routes(self, routes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Parse flight routes"""
        parsed_routes = []
        
        for route in routes:
            try:
                parsed_route = {
                    "departure": {
                        "airport": route.get("flyFrom"),
                        "time": route.get("dTimeUTC"),
                        "terminal": route.get("dep_terminal", "")
                    },
                    "arrival": {
                        "airport": route.get("flyTo"),
                        "time": route.get("aTimeUTC"),
                        "terminal": route.get("arr_terminal", "")
                    },
                    "carrier": route.get("airline"),
                    "flight_number": route.get("flight_no"),
                    "aircraft": route.get("equipment", ""),
                    "duration": route.get("duration", 0),
                    "stops": 0 if route.get("return") == 0 else 1
                }
                
                parsed_routes.append(parsed_route)
                
            except Exception as e:
                logger.error(f"Failed to parse Kiwi route: {e}")
                continue
        
        return parsed_routes
    
    def _parse_airport_suggestions(self, locations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Parse airport suggestions"""
        parsed_suggestions = []
        
        for location in locations:
            try:
                parsed_suggestion = {
                    "code": location.get("code"),
                    "name": location.get("name"),
                    "city": location.get("city", {}).get("name", ""),
                    "country": location.get("country", {}).get("name", ""),
                    "type": location.get("type", "airport")
                }
                
                parsed_suggestions.append(parsed_suggestion)
                
            except Exception as e:
                logger.error(f"Failed to parse airport suggestion: {e}")
                continue
        
        return parsed_suggestions
    
    def _map_cabin_class(self, kiwi_class: str) -> str:
        """Map Kiwi cabin class to standard format"""
        mapping = {
            "M": "ECONOMY",
            "W": "PREMIUM_ECONOMY",
            "C": "BUSINESS",
            "F": "FIRST"
        }
        return mapping.get(kiwi_class, "ECONOMY")
    
    async def get_flight_status(self, flight_number: str, departure_date: str) -> Optional[Dict[str, Any]]:
        """Get flight status (if available)"""
        # Note: Kiwi doesn't provide real-time flight status
        # This would need to be implemented with a different service
        return None

# Global instance
kiwi_client = KiwiClient()
