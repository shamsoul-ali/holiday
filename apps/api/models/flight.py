"""
Flight data models
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class FlightSegment(BaseModel):
    departure: Dict[str, Any] = Field(..., description="Departure information")
    arrival: Dict[str, Any] = Field(..., description="Arrival information")
    carrier: str = Field(..., description="Airline carrier")
    flight_number: str = Field(..., description="Flight number")
    aircraft: Optional[str] = Field(None, description="Aircraft type")
    duration: Optional[int] = Field(None, description="Flight duration in minutes")
    stops: int = Field(default=0, description="Number of stops")

class FlightOffer(BaseModel):
    id: str = Field(..., description="Unique flight offer ID")
    provider: str = Field(..., description="Provider name (amadeus, kiwi, etc.)")
    total_price: float = Field(..., description="Total price")
    currency: str = Field(..., description="Currency code")
    cabin_class: str = Field(..., description="Cabin class")
    outbound: List[FlightSegment] = Field(..., description="Outbound flight segments")
    inbound: List[FlightSegment] = Field(default=[], description="Inbound flight segments")
    booking_class: str = Field(..., description="Booking class")
    validating_airline: str = Field(..., description="Validating airline")
    instant_ticketing: bool = Field(default=True, description="Instant ticketing available")
    source: str = Field(..., description="Data source")
    deep_link: Optional[str] = Field(None, description="Direct booking link")
