"""
Data models package
"""

from .itinerary import (
    ItineraryRequest,
    ItineraryResponse,
    TripOption,
    TravelStyle,
    Preferences,
    SpecialRequirements
)
from .flight import FlightOffer, FlightSegment
from .hotel import HotelOffer
from .activity import ActivityOffer

__all__ = [
    "ItineraryRequest",
    "ItineraryResponse", 
    "TripOption",
    "FlightOffer",
    "FlightSegment",
    "HotelOffer",
    "ActivityOffer",
    "TravelStyle",
    "Preferences",
    "SpecialRequirements"
]
