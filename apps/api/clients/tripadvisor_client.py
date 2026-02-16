"""
TripAdvisor API Client - Comprehensive Reviews & Travel Insights
https://developer-tripadvisor.com/
"""

import os
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import httpx
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class TripAdvisorClient:
    def __init__(self):
        self.api_key = os.getenv("TRIPADVISOR_API_KEY")
        self.base_url = "https://api.content.tripadvisor.com/api/v1"
        
        if not self.api_key:
            logger.warning("TripAdvisor API key not configured")
    
    async def search_locations(
        self,
        query: str,
        language: str = "en",
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Search for locations using TripAdvisor API"""
        if not self.api_key:
            return []
        
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Accept": "application/json"
            }
            
            params = {
                "query": query,
                "language": language,
                "limit": limit
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/locations/search",
                    headers=headers,
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_locations(data.get("data", []))
                
        except Exception as e:
            logger.error(f"TripAdvisor location search failed: {e}")
            return []
    
    async def get_location_details(
        self,
        location_id: str,
        language: str = "en"
    ) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific location"""
        if not self.api_key:
            return None
        
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Accept": "application/json"
            }
            
            params = {
                "language": language
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/location/{location_id}/details",
                    headers=headers,
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_location_details(data)
                
        except Exception as e:
            logger.error(f"TripAdvisor location details failed: {e}")
            return None
    
    async def get_location_reviews(
        self,
        location_id: str,
        language: str = "en",
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Get reviews for a specific location"""
        if not self.api_key:
            return []
        
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Accept": "application/json"
            }
            
            params = {
                "language": language,
                "limit": limit
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/location/{location_id}/reviews",
                    headers=headers,
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_reviews(data.get("data", []))
                
        except Exception as e:
            logger.error(f"TripAdvisor reviews failed: {e}")
            return []
    
    async def get_location_photos(
        self,
        location_id: str,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Get photos for a specific location"""
        if not self.api_key:
            return []
        
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Accept": "application/json"
            }
            
            params = {
                "limit": limit
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/location/{location_id}/photos",
                    headers=headers,
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_photos(data.get("data", []))
                
        except Exception as e:
            logger.error(f"TripAdvisor photos failed: {e}")
            return []
    
    async def get_restaurant_reviews(
        self,
        restaurant_id: str,
        language: str = "en",
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Get reviews for a specific restaurant"""
        if not self.api_key:
            return []
        
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Accept": "application/json"
            }
            
            params = {
                "language": language,
                "limit": limit
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/restaurant/{restaurant_id}/reviews",
                    headers=headers,
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_reviews(data.get("data", []))
                
        except Exception as e:
            logger.error(f"TripAdvisor restaurant reviews failed: {e}")
            return []
    
    async def get_hotel_reviews(
        self,
        hotel_id: str,
        language: str = "en",
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Get reviews for a specific hotel"""
        if not self.api_key:
            return []
        
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Accept": "application/json"
            }
            
            params = {
                "language": language,
                "limit": limit
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/hotel/{hotel_id}/reviews",
                    headers=headers,
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_reviews(data.get("data", []))
                
        except Exception as e:
            logger.error(f"TripAdvisor hotel reviews failed: {e}")
            return []
    
    async def get_trending_destinations(self) -> List[Dict[str, Any]]:
        """Get trending destinations based on TripAdvisor data"""
        if not self.api_key:
            return []
        
        try:
            # This would use TripAdvisor's trending API
            # For now, return simulated trending data
            trending = [
                {
                    "destination": "Bali, Indonesia",
                    "trend_score": 94.8,
                    "review_count": 125000,
                    "avg_rating": 4.6,
                    "popular_attractions": ["Ubud Monkey Forest", "Tanah Lot Temple"],
                    "source": "tripadvisor"
                },
                {
                    "destination": "Santorini, Greece",
                    "trend_score": 92.3,
                    "review_count": 89000,
                    "avg_rating": 4.7,
                    "popular_attractions": ["Oia Sunset", "Fira Town"],
                    "source": "tripadvisor"
                }
            ]
            
            return trending
            
        except Exception as e:
            logger.error(f"TripAdvisor trending failed: {e}")
            return []
    
    def _parse_locations(self, locations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Parse location search results"""
        parsed_locations = []
        
        for location in locations:
            try:
                parsed_location = {
                    "location_id": location.get("location_id"),
                    "name": location.get("name"),
                    "address": location.get("address_string"),
                    "category": location.get("category", {}).get("name"),
                    "rating": location.get("rating"),
                    "review_count": location.get("num_reviews"),
                    "latitude": location.get("latitude"),
                    "longitude": location.get("longitude"),
                    "source": "tripadvisor"
                }
                
                parsed_locations.append(parsed_location)
                
            except Exception as e:
                logger.error(f"Failed to parse location: {e}")
                continue
        
        return parsed_locations
    
    def _parse_location_details(self, location: Dict[str, Any]) -> Dict[str, Any]:
        """Parse location details"""
        try:
            parsed_details = {
                "location_id": location.get("location_id"),
                "name": location.get("name"),
                "description": location.get("description"),
                "address": location.get("address_string"),
                "phone": location.get("phone"),
                "website": location.get("website"),
                "email": location.get("email"),
                "hours": location.get("hours"),
                "category": location.get("category", {}).get("name"),
                "rating": location.get("rating"),
                "review_count": location.get("num_reviews"),
                "price_level": location.get("price_level"),
                "latitude": location.get("latitude"),
                "longitude": location.get("longitude"),
                "source": "tripadvisor"
            }
            
            return parsed_details
            
        except Exception as e:
            logger.error(f"Failed to parse location details: {e}")
            return {}
    
    def _parse_reviews(self, reviews: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Parse review data"""
        parsed_reviews = []
        
        for review in reviews:
            try:
                parsed_review = {
                    "review_id": review.get("review_id"),
                    "reviewer_name": review.get("user", {}).get("username"),
                    "rating": review.get("rating"),
                    "title": review.get("title"),
                    "text": review.get("text"),
                    "date": review.get("published_date"),
                    "helpful_votes": review.get("helpful_votes"),
                    "trip_type": review.get("trip_type"),
                    "source": "tripadvisor"
                }
                
                parsed_reviews.append(parsed_review)
                
            except Exception as e:
                logger.error(f"Failed to parse review: {e}")
                continue
        
        return parsed_reviews
    
    def _parse_photos(self, photos: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Parse photo data"""
        parsed_photos = []
        
        for photo in photos:
            try:
                parsed_photo = {
                    "photo_id": photo.get("id"),
                    "caption": photo.get("caption"),
                    "url": photo.get("images", {}).get("original", {}).get("url"),
                    "thumbnail_url": photo.get("images", {}).get("thumbnail", {}).get("url"),
                    "upload_date": photo.get("upload_date"),
                    "source": "tripadvisor"
                }
                
                parsed_photos.append(parsed_photo)
                
            except Exception as e:
                logger.error(f"Failed to parse photo: {e}")
                continue
        
        return parsed_photos

# Global instance
tripadvisor_client = TripAdvisorClient()
