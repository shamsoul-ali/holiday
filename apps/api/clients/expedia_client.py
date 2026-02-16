"""
Expedia Rapid API Client - Hotels & Package Deals
https://rapidapi.com/apidojo/api/hotels4/
"""

import os
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import httpx
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class ExpediaClient:
    def __init__(self):
        self.api_key = os.getenv("EXPEDIA_RAPID_KEY")
        self.base_url = "https://hotels4.p.rapidapi.com"
        
        if not self.api_key:
            logger.warning("Expedia Rapid API key not configured")
    
    async def search_hotels(
        self,
        city: str,
        check_in: str,
        check_out: str,
        adults: int = 1,
        children: int = 0,
        currency: str = "MYR"
    ) -> List[Dict[str, Any]]:
        """Search for hotels using Expedia Rapid API"""
        if not self.api_key:
            return []
        
        try:
            headers = {
                "X-RapidAPI-Key": self.api_key,
                "X-RapidAPI-Host": "hotels4.p.rapidapi.com"
            }
            
            # First, get destination ID
            destination_id = await self._get_destination_id(city)
            if not destination_id:
                return []
            
            params = {
                "destinationId": destination_id,
                "pageNumber": "1",
                "pageSize": "25",
                "checkIn": check_in,
                "checkOut": check_out,
                "adults1": str(adults),
                "children1": str(children),
                "currency": currency,
                "sortOrder": "PRICE"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/properties/list",
                    headers=headers,
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_hotels(data.get("data", {}).get("body", {}).get("searchResults", {}).get("results", []))
                
        except Exception as e:
            logger.error(f"Expedia hotel search failed: {e}")
            return []
    
    async def _get_destination_id(self, city: str) -> Optional[str]:
        """Get destination ID for a city"""
        try:
            headers = {
                "X-RapidAPI-Key": self.api_key,
                "X-RapidAPI-Host": "hotels4.p.rapidapi.com"
            }
            
            params = {
                "query": city,
                "locale": "en_US",
                "currency": "MYR"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/locations/v3/search",
                    headers=headers,
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                suggestions = data.get("suggestions", [])
                for suggestion in suggestions:
                    entities = suggestion.get("entities", [])
                    for entity in entities:
                        if entity.get("type") == "CITY":
                            return entity.get("destinationId")
                
                return None
                
        except Exception as e:
            logger.error(f"Expedia destination ID failed: {e}")
            return None
    
    async def get_hotel_details(
        self,
        hotel_id: str,
        check_in: str,
        check_out: str,
        adults: int = 1,
        children: int = 0,
        currency: str = "MYR"
    ) -> Optional[Dict[str, Any]]:
        """Get detailed hotel information"""
        if not self.api_key:
            return None
        
        try:
            headers = {
                "X-RapidAPI-Key": self.api_key,
                "X-RapidAPI-Host": "hotels4.p.rapidapi.com"
            }
            
            params = {
                "id": hotel_id,
                "checkIn": check_in,
                "checkOut": check_out,
                "adults1": str(adults),
                "children1": str(children),
                "currency": currency
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/properties/get-details",
                    headers=headers,
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_hotel_details(data.get("data", {}).get("body", {}).get("content", {}))
                
        except Exception as e:
            logger.error(f"Expedia hotel details failed: {e}")
            return None
    
    async def search_packages(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        return_date: str,
        adults: int = 1,
        children: int = 0,
        currency: str = "MYR"
    ) -> List[Dict[str, Any]]:
        """Search for flight + hotel packages"""
        if not self.api_key:
            return []
        
        try:
            # This would use Expedia's package search API
            # For now, return simulated package data
            mock_packages = [
                {
                    "id": f"expedia_package_{origin}_{destination}_1",
                    "origin": origin,
                    "destination": destination,
                    "departure_date": departure_date,
                    "return_date": return_date,
                    "adults": adults,
                    "children": children,
                    "total_price": 2500.0,
                    "currency": currency,
                    "flight_price": 1200.0,
                    "hotel_price": 800.0,
                    "taxes_fees": 500.0,
                    "hotel_name": "Luxury Resort & Spa",
                    "hotel_rating": 4.5,
                    "flight_airline": "Malaysia Airlines",
                    "source": "expedia",
                    "deep_link": f"https://www.expedia.com/Package-FlightHotel?origin={origin}&destination={destination}"
                }
            ]
            
            return mock_packages
            
        except Exception as e:
            logger.error(f"Expedia package search failed: {e}")
            return []
    
    async def get_hotel_reviews(
        self,
        hotel_id: str,
        max_reviews: int = 20
    ) -> List[Dict[str, Any]]:
        """Get hotel reviews"""
        if not self.api_key:
            return []
        
        try:
            headers = {
                "X-RapidAPI-Key": self.api_key,
                "X-RapidAPI-Host": "hotels4.p.rapidapi.com"
            }
            
            params = {
                "id": hotel_id,
                "pageNumber": "1",
                "pageSize": str(max_reviews),
                "sort": "SORT_MOST_RELEVANT"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/reviews/list",
                    headers=headers,
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_reviews(data.get("data", {}).get("body", {}).get("reviews", {}).get("reviewInfo", {}).get("reviews", []))
                
        except Exception as e:
            logger.error(f"Expedia hotel reviews failed: {e}")
            return []
    
    async def get_hotel_photos(
        self,
        hotel_id: str,
        max_photos: int = 20
    ) -> List[Dict[str, Any]]:
        """Get hotel photos"""
        if not self.api_key:
            return []
        
        try:
            headers = {
                "X-RapidAPI-Key": self.api_key,
                "X-RapidAPI-Host": "hotels4.p.rapidapi.com"
            }
            
            params = {
                "id": hotel_id,
                "pageNumber": "1",
                "pageSize": str(max_photos)
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/properties/get-hotel-photos",
                    headers=headers,
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_photos(data.get("data", {}).get("body", {}).get("hotelImages", []))
                
        except Exception as e:
            logger.error(f"Expedia hotel photos failed: {e}")
            return []
    
    def _parse_hotels(self, hotels: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Parse hotel search results"""
        parsed_hotels = []
        
        for hotel in hotels:
            try:
                parsed_hotel = {
                    "id": hotel.get("id"),
                    "name": hotel.get("name"),
                    "address": hotel.get("address", {}).get("streetAddress", ""),
                    "rating": hotel.get("starRating", 0),
                    "price": hotel.get("ratePlan", {}).get("price", {}).get("current", ""),
                    "currency": "MYR",  # Default
                    "amenities": hotel.get("amenities", []),
                    "room_type": "Standard Room",  # Default
                    "source": "expedia",
                    "deep_link": f"https://www.expedia.com/h{hotel.get('id')}.Hotel-Information"
                }
                
                parsed_hotels.append(parsed_hotel)
                
            except Exception as e:
                logger.error(f"Failed to parse hotel: {e}")
                continue
        
        return parsed_hotels
    
    def _parse_hotel_details(self, hotel: Dict[str, Any]) -> Dict[str, Any]:
        """Parse hotel details"""
        try:
            parsed_details = {
                "id": hotel.get("hotelId"),
                "name": hotel.get("hotelName"),
                "description": hotel.get("description", ""),
                "address": hotel.get("address", {}),
                "phone": hotel.get("phone", ""),
                "website": hotel.get("website", ""),
                "email": hotel.get("email", ""),
                "amenities": hotel.get("amenities", []),
                "policies": hotel.get("policies", {}),
                "source": "expedia"
            }
            
            return parsed_details
            
        except Exception as e:
            logger.error(f"Failed to parse hotel details: {e}")
            return {}
    
    def _parse_reviews(self, reviews: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Parse hotel reviews"""
        parsed_reviews = []
        
        for review in reviews:
            try:
                parsed_review = {
                    "review_id": review.get("reviewId"),
                    "reviewer_name": review.get("user", {}).get("name", ""),
                    "rating": review.get("rating", 0),
                    "title": review.get("title", ""),
                    "text": review.get("text", ""),
                    "date": review.get("publishedDate", ""),
                    "helpful_votes": review.get("helpfulVotes", 0),
                    "trip_type": review.get("tripType", ""),
                    "source": "expedia"
                }
                
                parsed_reviews.append(parsed_review)
                
            except Exception as e:
                logger.error(f"Failed to parse review: {e}")
                continue
        
        return parsed_reviews
    
    def _parse_photos(self, photos: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Parse hotel photos"""
        parsed_photos = []
        
        for photo in photos:
            try:
                parsed_photo = {
                    "photo_id": photo.get("id"),
                    "caption": photo.get("caption", ""),
                    "url": photo.get("imageUrl", ""),
                    "thumbnail_url": photo.get("thumbnailUrl", ""),
                    "upload_date": photo.get("uploadDate", ""),
                    "source": "expedia"
                }
                
                parsed_photos.append(parsed_photo)
                
            except Exception as e:
                logger.error(f"Failed to parse photo: {e}")
                continue
        
        return parsed_photos

# Global instance
expedia_client = ExpediaClient()
