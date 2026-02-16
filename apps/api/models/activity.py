"""
Activity data models
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ActivityOffer(BaseModel):
    place_id: str = Field(..., description="Google Places ID")
    name: str = Field(..., description="Activity/attraction name")
    address: str = Field(..., description="Address")
    rating: Optional[float] = Field(None, description="Rating (0-5)")
    price_level: Optional[int] = Field(None, description="Price level (0-4)")
    types: List[str] = Field(default=[], description="Place types")
    photos: List[Dict[str, Any]] = Field(default=[], description="Photos")
    opening_hours: Optional[Dict[str, Any]] = Field(None, description="Opening hours")
    source: str = Field(..., description="Data source")
    deep_link: Optional[str] = Field(None, description="Direct booking link")
