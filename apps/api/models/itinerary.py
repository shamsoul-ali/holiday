"""
Itinerary data models
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import date
from enum import Enum

class TravelStyle(str, Enum):
    BUDGET = "budget"
    COMFORT = "comfort"
    LUXURY = "luxury"
    ADVENTURE = "adventure"
    RELAXATION = "relaxation"

class Preferences(BaseModel):
    halal_friendly: bool = Field(default=False, description="Halal dining preferences")
    family_friendly: bool = Field(default=False, description="Family-friendly activities")
    luxury_experience: bool = Field(default=False, description="Luxury accommodations and services")
    nature_outdoors: bool = Field(default=False, description="Nature and outdoor activities")
    city_life: bool = Field(default=False, description="Urban and city experiences")
    culture_history: bool = Field(default=False, description="Cultural and historical sites")
    adventure_sports: bool = Field(default=False, description="Adventure and sports activities")
    wellness_spa: bool = Field(default=False, description="Wellness and spa experiences")

class SpecialRequirements(BaseModel):
    wheelchair_accessible: bool = Field(default=False, description="Wheelchair accessibility")
    dietary_restrictions: List[str] = Field(default=[], description="Dietary restrictions")
    language_preference: str = Field(default="en", description="Preferred language")
    prayer_room: bool = Field(default=False, description="Prayer room availability")
    quiet_environment: bool = Field(default=False, description="Quiet environment preference")

class ItineraryRequest(BaseModel):
    origin: str = Field(..., description="Origin airport/city code")
    destination: str = Field(..., description="Destination city or airport code")
    start_date: str = Field(..., description="Start date (YYYY-MM-DD)")
    end_date: str = Field(..., description="End date (YYYY-MM-DD)")
    passengers: int = Field(..., ge=1, le=10, description="Number of passengers")
    budget_per_person: float = Field(..., gt=0, description="Budget per person in MYR")
    travel_style: TravelStyle = Field(default=TravelStyle.COMFORT, description="Preferred travel style")
    preferences: Preferences = Field(default_factory=Preferences, description="Travel preferences")
    special_requirements: SpecialRequirements = Field(default_factory=SpecialRequirements, description="Special requirements")

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

class DailyActivity(BaseModel):
    time: str = Field(..., description="Activity time (HH:MM)")
    activity: str = Field(..., description="Activity name")
    description: str = Field(..., description="Activity description")
    duration: str = Field(..., description="Activity duration")
    cost: float = Field(default=0, description="Activity cost")
    location: str = Field(..., description="Activity location")
    tips: List[str] = Field(default=[], description="Activity tips")

class DailyMeal(BaseModel):
    time: str = Field(..., description="Meal time (HH:MM)")
    type: str = Field(..., description="Meal type (breakfast, lunch, dinner)")
    restaurant: str = Field(..., description="Restaurant name")
    cuisine: str = Field(..., description="Cuisine type")
    cost: float = Field(default=0, description="Meal cost")
    halal_certified: bool = Field(default=False, description="Halal certification")
    recommendation: str = Field(..., description="Why recommended")

class DailyItinerary(BaseModel):
    day: int = Field(..., description="Day number")
    theme: str = Field(..., description="Day theme")
    activities: List[DailyActivity] = Field(default=[], description="Day activities")
    meals: List[DailyMeal] = Field(default=[], description="Day meals")
    transportation: str = Field(..., description="Transportation notes")
    daily_budget: float = Field(default=0, description="Daily budget estimate")

class EmergencyInfo(BaseModel):
    police: str = Field(..., description="Police contact")
    hospital: str = Field(..., description="Hospital contact")
    embassy: str = Field(..., description="Embassy contact")

class TripOption(BaseModel):
    tier: str = Field(..., description="Tier level (BUDGET, COMFORT, LUXURY)")
    title: Optional[str] = Field(None, description="Option title")
    flights: List[FlightOffer] = Field(default=[], description="Selected flights")
    hotel: Optional[HotelOffer] = Field(None, description="Selected hotel")
    activities: List[ActivityOffer] = Field(default=[], description="Selected activities")
    daily_itinerary: List[DailyItinerary] = Field(default=[], description="Daily itinerary")
    total_cost: float = Field(..., description="Total cost for this option")
    currency: str = Field(..., description="Currency code")
    description: str = Field(..., description="Option description")
    highlights: List[str] = Field(default=[], description="Key highlights")
    travel_tips: List[str] = Field(default=[], description="Travel tips")
    packing_suggestions: List[str] = Field(default=[], description="Packing suggestions")
    local_customs: List[str] = Field(default=[], description="Local customs")
    emergency_info: Optional[EmergencyInfo] = Field(None, description="Emergency information")
    estimated_savings: Optional[float] = Field(None, description="Estimated savings vs. retail")
    ai_generated: bool = Field(default=False, description="Generated by AI")

class ItineraryResponse(BaseModel):
    request_id: str = Field(..., description="Unique request ID")
    title: str = Field(..., description="Itinerary title")
    budget: Dict[str, Any] = Field(..., description="Budget information")
    emissions_kg: float = Field(..., description="Estimated carbon emissions")
    options: List[TripOption] = Field(..., description="Available trip options")
    weather: Dict[str, Any] = Field(default={}, description="Weather information")
    generated_at: str = Field(..., description="Generation timestamp")
    source: str = Field(..., description="Data source")
    recommendations: Optional[List[str]] = Field(None, description="AI recommendations")
    travel_tips: Optional[List[str]] = Field(None, description="Travel tips")
