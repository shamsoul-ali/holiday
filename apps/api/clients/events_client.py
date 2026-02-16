"""
Events API Client for real-time events data
Integrates with Ticketmaster, Eventbrite, and other event APIs
"""

import os
import asyncio
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
import httpx
from fastapi import HTTPException
import logging
from config.api_keys import api_key_manager, APIProvider

logger = logging.getLogger(__name__)

class EventsClient:
    def __init__(self):
        self.ticketmaster_key = None
        self.eventbrite_key = None
        self._initialize_clients()
    
    def _initialize_clients(self):
        """Initialize event API clients based on available keys"""
        ticketmaster_config = api_key_manager.get_config(APIProvider.TICKETMASTER)
        if ticketmaster_config and ticketmaster_config.key:
            self.ticketmaster_key = ticketmaster_config.key
            logger.info("Ticketmaster client initialized")
        
        # Add other event APIs as needed
        eventbrite_key = os.getenv("EVENTBRITE_API_KEY")
        if eventbrite_key:
            self.eventbrite_key = eventbrite_key
            logger.info("Eventbrite client initialized")
    
    async def search_events_by_location(
        self,
        city: str,
        country_code: str = "US",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        category: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Search for events by location and date range"""
        all_events = []
        
        # Try Ticketmaster first
        if self.ticketmaster_key:
            tm_events = await self._search_ticketmaster_events(
                city, country_code, start_date, end_date, category, limit
            )
            all_events.extend(tm_events)
        
        # Try other event sources
        if self.eventbrite_key:
            eb_events = await self._search_eventbrite_events(
                city, start_date, end_date, category, limit
            )
            all_events.extend(eb_events)
        
        # Add free/public events from other sources
        free_events = await self._search_free_events(city, start_date, end_date)
        all_events.extend(free_events)
        
        # Sort by date and relevance
        return self._sort_and_deduplicate_events(all_events, limit)
    
    async def search_events_by_coordinates(
        self,
        latitude: float,
        longitude: float,
        radius_km: int = 50,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        category: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Search for events by GPS coordinates"""
        all_events = []
        
        if self.ticketmaster_key:
            tm_events = await self._search_ticketmaster_by_coordinates(
                latitude, longitude, radius_km, start_date, end_date, category, limit
            )
            all_events.extend(tm_events)
        
        return self._sort_and_deduplicate_events(all_events, limit)
    
    async def get_seasonal_events(
        self,
        city: str,
        month: int,
        year: int = None,
        event_types: List[str] = None
    ) -> List[Dict[str, Any]]:
        """Get seasonal events for a specific month"""
        if year is None:
            year = datetime.now().year
        
        # Calculate date range for the month
        start_date = f"{year}-{month:02d}-01"
        if month == 12:
            end_date = f"{year + 1}-01-01"
        else:
            end_date = f"{year}-{month + 1:02d}-01"
        
        # Default seasonal event types
        if event_types is None:
            event_types = self._get_seasonal_event_types(month)
        
        seasonal_events = []
        
        for event_type in event_types:
            events = await self.search_events_by_location(
                city=city,
                start_date=start_date,
                end_date=end_date,
                category=event_type,
                limit=10
            )
            seasonal_events.extend(events)
        
        return self._sort_and_deduplicate_events(seasonal_events, 30)
    
    async def _search_ticketmaster_events(
        self,
        city: str,
        country_code: str,
        start_date: Optional[str],
        end_date: Optional[str],
        category: Optional[str],
        limit: int
    ) -> List[Dict[str, Any]]:
        """Search Ticketmaster events API"""
        if not self.ticketmaster_key:
            return []
        
        try:
            params = {
                "apikey": self.ticketmaster_key,
                "city": city,
                "countryCode": country_code,
                "size": min(limit, 200),  # Ticketmaster max is 200
                "sort": "date,asc"
            }
            
            if start_date:
                params["startDateTime"] = f"{start_date}T00:00:00Z"
            if end_date:
                params["endDateTime"] = f"{end_date}T23:59:59Z"
            if category:
                params["classificationName"] = category
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://app.ticketmaster.com/discovery/v2/events.json",
                    params=params,
                    timeout=15.0
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_ticketmaster_events(data)
                
        except Exception as e:
            logger.error(f"Ticketmaster search failed: {e}")
            return []
    
    async def _search_ticketmaster_by_coordinates(
        self,
        latitude: float,
        longitude: float,
        radius_km: int,
        start_date: Optional[str],
        end_date: Optional[str],
        category: Optional[str],
        limit: int
    ) -> List[Dict[str, Any]]:
        """Search Ticketmaster events by coordinates"""
        if not self.ticketmaster_key:
            return []
        
        try:
            params = {
                "apikey": self.ticketmaster_key,
                "latlong": f"{latitude},{longitude}",
                "radius": radius_km,
                "unit": "km",
                "size": min(limit, 200),
                "sort": "date,asc"
            }
            
            if start_date:
                params["startDateTime"] = f"{start_date}T00:00:00Z"
            if end_date:
                params["endDateTime"] = f"{end_date}T23:59:59Z"
            if category:
                params["classificationName"] = category
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://app.ticketmaster.com/discovery/v2/events.json",
                    params=params,
                    timeout=15.0
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_ticketmaster_events(data)
                
        except Exception as e:
            logger.error(f"Ticketmaster coordinate search failed: {e}")
            return []
    
    async def _search_eventbrite_events(
        self,
        city: str,
        start_date: Optional[str],
        end_date: Optional[str],
        category: Optional[str],
        limit: int
    ) -> List[Dict[str, Any]]:
        """Search Eventbrite events (placeholder - requires OAuth)"""
        # Note: Eventbrite requires OAuth flow, so this is simplified
        logger.info("Eventbrite integration placeholder - OAuth setup required")
        return []
    
    async def _search_free_events(
        self,
        city: str,
        start_date: Optional[str],
        end_date: Optional[str]
    ) -> List[Dict[str, Any]]:
        """Search for free/public events from various sources"""
        free_events = []
        
        # Add culturally significant events
        cultural_events = self._get_cultural_events(city, start_date, end_date)
        free_events.extend(cultural_events)
        
        # Add religious/holiday events if applicable
        religious_events = self._get_religious_events(city, start_date, end_date)
        free_events.extend(religious_events)
        
        return free_events
    
    def _parse_ticketmaster_events(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse Ticketmaster API response"""
        events = []
        
        embedded = data.get("_embedded", {})
        tm_events = embedded.get("events", [])
        
        for event in tm_events:
            try:
                # Parse basic event info
                parsed_event = {
                    "id": event.get("id"),
                    "name": event.get("name"),
                    "description": event.get("info", ""),
                    "url": event.get("url"),
                    "source": "ticketmaster",
                    "type": "ticketed_event"
                }
                
                # Parse dates
                dates = event.get("dates", {})
                start_date = dates.get("start", {})
                parsed_event["start_date"] = start_date.get("localDate")
                parsed_event["start_time"] = start_date.get("localTime")
                parsed_event["timezone"] = start_date.get("timezone")
                
                # Parse venue
                embedded_venue = event.get("_embedded", {})
                venues = embedded_venue.get("venues", [])
                if venues:
                    venue = venues[0]
                    parsed_event["venue"] = {
                        "name": venue.get("name"),
                        "address": self._parse_venue_address(venue),
                        "city": venue.get("city", {}).get("name"),
                        "country": venue.get("country", {}).get("name"),
                        "coordinates": {
                            "latitude": venue.get("location", {}).get("latitude"),
                            "longitude": venue.get("location", {}).get("longitude")
                        }
                    }
                
                # Parse pricing
                price_ranges = event.get("priceRanges", [])
                if price_ranges:
                    price_range = price_ranges[0]
                    parsed_event["price"] = {
                        "min": price_range.get("min"),
                        "max": price_range.get("max"),
                        "currency": price_range.get("currency")
                    }
                
                # Parse categories
                classifications = event.get("classifications", [])
                if classifications:
                    classification = classifications[0]
                    parsed_event["category"] = {
                        "segment": classification.get("segment", {}).get("name"),
                        "genre": classification.get("genre", {}).get("name"),
                        "subGenre": classification.get("subGenre", {}).get("name")
                    }
                
                # Parse images
                images = event.get("images", [])
                if images:
                    parsed_event["image"] = images[0].get("url")
                
                events.append(parsed_event)
                
            except Exception as e:
                logger.error(f"Failed to parse Ticketmaster event: {e}")
                continue
        
        return events
    
    def _parse_venue_address(self, venue: Dict[str, Any]) -> str:
        """Parse venue address from Ticketmaster venue data"""
        address_parts = []
        
        if venue.get("address", {}).get("line1"):
            address_parts.append(venue["address"]["line1"])
        if venue.get("address", {}).get("line2"):
            address_parts.append(venue["address"]["line2"])
        if venue.get("city", {}).get("name"):
            address_parts.append(venue["city"]["name"])
        if venue.get("state", {}).get("stateCode"):
            address_parts.append(venue["state"]["stateCode"])
        if venue.get("postalCode"):
            address_parts.append(venue["postalCode"])
        
        return ", ".join(address_parts)
    
    def _get_seasonal_event_types(self, month: int) -> List[str]:
        """Get appropriate event types for the season"""
        seasonal_types = {
            1: ["New Year", "Winter Sports", "Indoor Concerts"],  # January
            2: ["Valentine's Day", "Winter Festivals", "Indoor Events"],  # February
            3: ["Spring Festivals", "Outdoor Markets", "Cultural Events"],  # March
            4: ["Easter Events", "Spring Concerts", "Garden Shows"],  # April
            5: ["May Day", "Spring Festivals", "Outdoor Concerts"],  # May
            6: ["Summer Festivals", "Outdoor Events", "Music Festivals"],  # June
            7: ["Summer Concerts", "Beach Events", "Independence Day"],  # July
            8: ["Summer Festivals", "Outdoor Markets", "Music Festivals"],  # August
            9: ["Harvest Festivals", "Back to School", "Cultural Events"],  # September
            10: ["Halloween", "Autumn Festivals", "Oktoberfest"],  # October
            11: ["Thanksgiving", "Holiday Markets", "Indoor Events"],  # November
            12: ["Christmas Markets", "New Year Prep", "Holiday Events"]  # December
        }
        
        return seasonal_types.get(month, ["General Events"])
    
    def _get_cultural_events(
        self,
        city: str,
        start_date: Optional[str],
        end_date: Optional[str]
    ) -> List[Dict[str, Any]]:
        """Get cultural events for the city"""
        # This would integrate with cultural calendars, museum events, etc.
        # For now, return common cultural events
        cultural_events = [
            {
                "id": f"cultural_{city}_museum",
                "name": f"{city} Museum Exhibitions",
                "description": "Ongoing museum exhibitions and cultural displays",
                "type": "cultural_event",
                "source": "cultural_calendar",
                "category": {"segment": "Arts & Culture"},
                "venue": {"name": f"{city} Cultural District"}
            }
        ]
        
        return cultural_events
    
    def _get_religious_events(
        self,
        city: str,
        start_date: Optional[str],
        end_date: Optional[str]
    ) -> List[Dict[str, Any]]:
        """Get religious and holiday events"""
        # This would integrate with religious calendars
        # For now, return major religious observances
        religious_events = []
        
        if start_date and end_date:
            # Add major Islamic holidays if in date range
            # This would normally be calculated based on lunar calendar
            religious_events.append({
                "id": f"islamic_{city}_events",
                "name": "Islamic Community Events",
                "description": "Check local mosque calendars for specific events",
                "type": "religious_event",
                "source": "religious_calendar",
                "category": {"segment": "Religious"}
            })
        
        return religious_events
    
    def _sort_and_deduplicate_events(
        self,
        events: List[Dict[str, Any]],
        limit: int
    ) -> List[Dict[str, Any]]:
        """Sort events by date and remove duplicates"""
        # Remove duplicates based on name and date
        seen = set()
        unique_events = []
        
        for event in events:
            key = f"{event.get('name', '')}_{event.get('start_date', '')}"
            if key not in seen:
                seen.add(key)
                unique_events.append(event)
        
        # Sort by start date
        def sort_key(event):
            date_str = event.get("start_date", "9999-12-31")
            try:
                return datetime.strptime(date_str, "%Y-%m-%d")
            except:
                return datetime.max
        
        unique_events.sort(key=sort_key)
        
        return unique_events[:limit]

# Global instance
events_client = EventsClient()