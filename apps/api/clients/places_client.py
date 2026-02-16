"""
Google Places API Client for attractions, restaurants, and POIs
https://developers.google.com/maps/documentation/places/web-service
"""

import os
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
import httpx
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class GooglePlacesClient:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_PLACES_API_KEY")
        self.base_url = "https://maps.googleapis.com/maps/api/place"
        
        if not self.api_key:
            logger.warning("Google Places API key not configured")
    
    async def search_nearby_places(
        self,
        latitude: float,
        longitude: float,
        radius: int = 5000,
        place_type: str = "restaurant",
        keyword: Optional[str] = None,
        min_price: int = 0,
        max_price: int = 4,
        open_now: bool = False
    ) -> List[Dict[str, Any]]:
        """Search for nearby places using Google Places Nearby Search API"""
        if not self.api_key:
            return []
        
        try:
            params = {
                "location": f"{latitude},{longitude}",
                "radius": radius,
                "type": place_type,
                "key": self.api_key,
                "language": "en"
            }
            
            if keyword:
                params["keyword"] = keyword
            
            if min_price > 0:
                params["minprice"] = min_price
            
            if max_price < 4:
                params["maxprice"] = max_price
            
            if open_now:
                params["opennow"] = "true"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/nearbysearch/json",
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                if data.get("status") != "OK":
                    logger.error(f"Google Places API error: {data.get('status')}")
                    return []
                
                return self._parse_places(data.get("results", []))
                
        except Exception as e:
            logger.error(f"Google Places nearby search failed: {e}")
            return []
    
    async def search_places_by_text(
        self,
        query: str,
        location: Optional[str] = None,
        radius: int = 50000,
        place_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Search for places by text query using Google Places Text Search API"""
        if not self.api_key:
            return []
        
        try:
            params = {
                "query": query,
                "key": self.api_key,
                "language": "en"
            }
            
            if location:
                params["location"] = location
                params["radius"] = radius
            
            if place_type:
                params["type"] = place_type
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/textsearch/json",
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                if data.get("status") != "OK":
                    logger.error(f"Google Places text search error: {data.get('status')}")
                    return []
                
                return self._parse_places(data.get("results", []))
                
        except Exception as e:
            logger.error(f"Google Places text search failed: {e}")
            return []
    
    async def get_place_details(
        self,
        place_id: str,
        fields: List[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific place"""
        if not self.api_key:
            return None
        
        if fields is None:
            fields = [
                "name", "formatted_address", "geometry", "rating", "user_ratings_total",
                "formatted_phone_number", "website", "opening_hours", "photos",
                "price_level", "types", "reviews", "place_id"
            ]
        
        try:
            params = {
                "place_id": place_id,
                "fields": ",".join(fields),
                "key": self.api_key,
                "language": "en"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/details/json",
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                if data.get("status") != "OK":
                    logger.error(f"Google Places details error: {data.get('status')}")
                    return None
                
                return self._parse_place_details(data.get("result", {}))
                
        except Exception as e:
            logger.error(f"Google Places details failed: {e}")
            return None
    
    async def search_halal_restaurants(
        self,
        latitude: float,
        longitude: float,
        radius: int = 5000
    ) -> List[Dict[str, Any]]:
        """Search for halal restaurants specifically"""
        if not self.api_key:
            return []
        
        try:
            # Search for restaurants with halal keywords
            halal_keywords = [
                "halal restaurant",
                "halal food",
                "muslim restaurant",
                "islamic restaurant"
            ]
            
            all_restaurants = []
            
            for keyword in halal_keywords:
                restaurants = await self.search_nearby_places(
                    latitude=latitude,
                    longitude=longitude,
                    radius=radius,
                    place_type="restaurant",
                    keyword=keyword
                )
                all_restaurants.extend(restaurants)
            
            # Remove duplicates and add halal score
            unique_restaurants = {}
            for restaurant in all_restaurants:
                place_id = restaurant.get("place_id")
                if place_id not in unique_restaurants:
                    restaurant["halal_score"] = self._calculate_halal_score(restaurant)
                    unique_restaurants[place_id] = restaurant
            
            # Sort by halal score
            sorted_restaurants = sorted(
                unique_restaurants.values(),
                key=lambda x: x.get("halal_score", 0),
                reverse=True
            )
            
            return sorted_restaurants[:20]  # Return top 20
            
        except Exception as e:
            logger.error(f"Halal restaurant search failed: {e}")
            return []
    
    async def search_family_attractions(
        self,
        latitude: float,
        longitude: float,
        radius: int = 10000
    ) -> List[Dict[str, Any]]:
        """Search for family-friendly attractions"""
        if not self.api_key:
            return []
        
        try:
            family_types = [
                "amusement_park",
                "aquarium",
                "museum",
                "zoo",
                "park",
                "tourist_attraction"
            ]
            
            all_attractions = []
            
            for place_type in family_types:
                attractions = await self.search_nearby_places(
                    latitude=latitude,
                    longitude=longitude,
                    radius=radius,
                    place_type=place_type
                )
                
                # Add family score to each attraction
                for attraction in attractions:
                    attraction["family_score"] = self._calculate_family_score(attraction)
                
                all_attractions.extend(attractions)
            
            # Sort by family score
            sorted_attractions = sorted(
                all_attractions,
                key=lambda x: x.get("family_score", 0),
                reverse=True
            )
            
            return sorted_attractions[:30]  # Return top 30
            
        except Exception as e:
            logger.error(f"Family attractions search failed: {e}")
            return []
    
    def _parse_places(self, places: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Parse and standardize place data"""
        parsed_places = []
        
        for place in places:
            try:
                parsed_place = {
                    "place_id": place.get("place_id"),
                    "name": place.get("name"),
                    "formatted_address": place.get("formatted_address"),
                    "geometry": {
                        "location": place.get("geometry", {}).get("location", {}),
                        "viewport": place.get("geometry", {}).get("viewport", {})
                    },
                    "types": place.get("types", []),
                    "rating": place.get("rating"),
                    "user_ratings_total": place.get("user_ratings_total"),
                    "price_level": place.get("price_level"),
                    "photos": place.get("photos", []),
                    "icon": place.get("icon"),
                    "icon_background_color": place.get("icon_background_color"),
                    "icon_mask_base_uri": place.get("icon_mask_base_uri"),
                    "opening_hours": place.get("opening_hours", {}),
                    "business_status": place.get("business_status"),
                    "vicinity": place.get("vicinity"),
                    "source": "google_places"
                }
                
                parsed_places.append(parsed_place)
                
            except Exception as e:
                logger.error(f"Failed to parse place: {e}")
                continue
        
        return parsed_places
    
    def _parse_place_details(self, place: Dict[str, Any]) -> Dict[str, Any]:
        """Parse and standardize place details"""
        try:
            parsed_details = {
                "place_id": place.get("place_id"),
                "name": place.get("name"),
                "formatted_address": place.get("formatted_address"),
                "geometry": place.get("geometry", {}),
                "rating": place.get("rating"),
                "user_ratings_total": place.get("user_ratings_total"),
                "formatted_phone_number": place.get("formatted_phone_number"),
                "website": place.get("website"),
                "opening_hours": place.get("opening_hours", {}),
                "photos": place.get("photos", []),
                "price_level": place.get("price_level"),
                "types": place.get("types", []),
                "reviews": place.get("reviews", []),
                "url": place.get("url"),
                "utc_offset": place.get("utc_offset"),
                "source": "google_places"
            }
            
            return parsed_details
            
        except Exception as e:
            logger.error(f"Failed to parse place details: {e}")
            return {}
    
    def _calculate_halal_score(self, restaurant: Dict[str, Any]) -> float:
        """Calculate halal-friendliness score (0-1)"""
        score = 0.0
        
        # Check name for halal indicators
        name = restaurant.get("name", "").lower()
        halal_indicators = ["halal", "muslim", "islamic", "arab", "middle eastern", "turkish", "malay", "indonesian"]
        
        for indicator in halal_indicators:
            if indicator in name:
                score += 0.3
                break
        
        # Check types for restaurant indicators
        types = restaurant.get("types", [])
        if "restaurant" in types:
            score += 0.2
        
        # Check rating (higher rating = more likely to be authentic)
        rating = restaurant.get("rating", 0)
        if rating >= 4.0:
            score += 0.2
        elif rating >= 3.5:
            score += 0.1
        
        # Check user ratings total (more reviews = more reliable)
        total_ratings = restaurant.get("user_ratings_total", 0)
        if total_ratings >= 100:
            score += 0.1
        elif total_ratings >= 50:
            score += 0.05
        
        return min(score, 1.0)
    
    def _calculate_family_score(self, attraction: Dict[str, Any]) -> float:
        """Calculate family-friendliness score (0-1)"""
        score = 0.0
        
        # Check types for family-friendly indicators
        types = attraction.get("types", [])
        family_types = ["amusement_park", "aquarium", "museum", "zoo", "park", "tourist_attraction"]
        
        for family_type in family_types:
            if family_type in types:
                score += 0.3
                break
        
        # Check rating (higher rating = more family-friendly)
        rating = attraction.get("rating", 0)
        if rating >= 4.0:
            score += 0.3
        elif rating >= 3.5:
            score += 0.2
        elif rating >= 3.0:
            score += 0.1
        
        # Check user ratings total (more reviews = more reliable)
        total_ratings = attraction.get("user_ratings_total", 0)
        if total_ratings >= 100:
            score += 0.2
        elif total_ratings >= 50:
            score += 0.1
        
        # Check price level (lower price = more accessible for families)
        price_level = attraction.get("price_level", 2)
        if price_level <= 1:
            score += 0.2
        elif price_level <= 2:
            score += 0.1
        
        return min(score, 1.0)

# Global instance
places_client = GooglePlacesClient()
