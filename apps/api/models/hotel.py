"""
Hotel data models
"""

from typing import List, Optional
from pydantic import BaseModel, Field

class HotelOffer(BaseModel):
    id: str = Field(..., description="Unique hotel offer ID")
    name: str = Field(..., description="Hotel name")
    address: str = Field(..., description="Hotel address")
    rating: float = Field(..., description="Hotel rating (0-5)")
    price: float = Field(..., description="Price per night")
    currency: str = Field(..., description="Currency code")
    amenities: List[str] = Field(default=[], description="Hotel amenities")
    room_type: str = Field(..., description="Room type")
    cancellation_policy: Optional[str] = Field(None, description="Cancellation policy")
    source: str = Field(..., description="Data source")
    deep_link: Optional[str] = Field(None, description="Direct booking link")
