from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
import json
from datetime import datetime

router = APIRouter(prefix="/api", tags=["trending"])

# Pydantic models for the API
class Top10Filters(BaseModel):
    halal: bool = False
    kids: bool = False
    luxury: bool = False
    nature: bool = False
    city: bool = False

class Top10Item(BaseModel):
    destination_code: str
    name: str
    from_price: Dict[str, Any]
    popularity_score: float
    signals: Dict[str, Any]
    weather: Dict[str, Any]
    events: List[Dict[str, Any]]
    badges: List[str]
    sample_package: Dict[str, Any]
    deep_links: Dict[str, Any]

class Top10Response(BaseModel):
    budget: int
    currency: str
    filters: Top10Filters
    items: List[Top10Item]
    generated_at: datetime

@router.get("/top10", response_model=Top10Response)
async def get_top10(
    budget: int = Query(..., ge=100, description="Budget in cents"),
    currency: str = Query("MYR", description="Currency code"),
    pax: int = Query(2, ge=1, le=10, description="Number of passengers"),
    month: Optional[str] = Query(None, description="Target month (YYYY-MM)"),
    halal: bool = Query(False, description="Halal preference"),
    kids: bool = Query(False, description="Kids-friendly preference"),
    luxury: bool = Query(False, description="Luxury preference"),
    nature: bool = Query(False, description="Nature preference"),
    city: bool = Query(False, description="City preference")
):
    """
    Get Top-10 destination recommendations based on budget and preferences.
    
    This endpoint provides AI-curated travel recommendations with real-time pricing,
    popularity signals, weather data, and events information.
    """
    
    # Validate month format if provided
    if month:
        try:
            datetime.strptime(month, "%Y-%m")
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid month format. Use YYYY-MM (e.g., 2025-12)"
            )
    
    # Build filters
    filters = Top10Filters(
        halal=halal,
        kids=kids,
        luxury=luxury,
        nature=nature,
        city=city
    )
    
    try:
        # TODO: Implement the actual service call
        # data = await get_top10_service(budget, currency, pax, month, filters)
        
        # For now, return mock data
        data = await get_mock_top10_data(budget, currency, pax, month, filters)
        
        return Top10Response(
            budget=budget,
            currency=currency,
            filters=filters,
            items=data,
            generated_at=datetime.utcnow()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch top 10 recommendations: {str(e)}"
        )

async def get_mock_top10_data(
    budget: int,
    currency: str,
    pax: int,
    month: Optional[str],
    filters: Top10Filters
) -> List[Top10Item]:
    """
    Mock data for development/testing purposes.
    In production, this would call the trending service.
    """
    
    # Mock destinations with realistic data
    mock_destinations = [
        {
            "destination_code": "TYO",
            "name": "Tokyo, Japan",
            "from_price": {"amount": int(budget * 0.15), "currency": currency},
            "popularity_score": 87.3,
            "signals": {
                "intent_7d_vs_28d": 1.34,
                "events_count": 12,
                "halal_index": 0.62
            },
            "weather": {
                "month": month or "2025-12",
                "comfort_index": 0.74,
                "avg_high_c": 12,
                "rain_prob": 0.21
            },
            "events": [
                {"name": "Illumination Festival", "date": "2025-12-28"},
                {"name": "New Year Countdown", "date": "2025-12-31"}
            ],
            "badges": ["Kids-friendly", "Halal options", "Eco"],
            "sample_package": {
                "nights": 5,
                "tier": "COMFORT",
                "hotel": "Shinjuku Granbell Hotel",
                "activities": ["DisneySea", "Asakusa Temple", "Shibuya Crossing"],
                "est_total": {"amount": int(budget * 0.35), "currency": currency}
            },
            "deep_links": {
                "flight": "https://example.com/flight/tyo",
                "hotel": "https://example.com/hotel/tyo",
                "activities": [
                    "https://example.com/activity/disneysea",
                    "https://example.com/activity/asakusa"
                ]
            }
        },
        {
            "destination_code": "BKK",
            "name": "Bangkok, Thailand",
            "from_price": {"amount": int(budget * 0.12), "currency": currency},
            "popularity_score": 92.1,
            "signals": {
                "intent_7d_vs_28d": 1.67,
                "events_count": 8,
                "halal_index": 0.89
            },
            "weather": {
                "month": month or "2025-12",
                "comfort_index": 0.85,
                "avg_high_c": 31,
                "rain_prob": 0.15
            },
            "events": [
                {"name": "Loy Krathong Festival", "date": "2025-12-15"}
            ],
            "badges": ["Halal-friendly", "Budget", "Culture"],
            "sample_package": {
                "nights": 4,
                "tier": "BUDGET",
                "hotel": "Siam@Siam Design Hotel",
                "activities": ["Grand Palace", "Chatuchak Market", "Wat Arun"],
                "est_total": {"amount": int(budget * 0.28), "currency": currency}
            },
            "deep_links": {
                "flight": "https://example.com/flight/bkk",
                "hotel": "https://example.com/hotel/bkk",
                "activities": [
                    "https://example.com/activity/grand-palace",
                    "https://example.com/activity/chatuchak"
                ]
            }
        },
        {
            "destination_code": "SIN",
            "name": "Singapore",
            "from_price": {"amount": int(budget * 0.18), "currency": currency},
            "popularity_score": 89.7,
            "signals": {
                "intent_7d_vs_28d": 1.23,
                "events_count": 15,
                "halal_index": 0.95
            },
            "weather": {
                "month": month or "2025-12",
                "comfort_index": 0.78,
                "avg_high_c": 30,
                "rain_prob": 0.45
            },
            "events": [
                {"name": "Christmas Wonderland", "date": "2025-12-20"},
                {"name": "New Year Countdown", "date": "2025-12-31"}
            ],
            "badges": ["Halal-certified", "Family-friendly", "Safe"],
            "sample_package": {
                "nights": 3,
                "tier": "COMFORT",
                "hotel": "Marina Bay Sands",
                "activities": ["Gardens by the Bay", "Sentosa Island", "Chinatown"],
                "est_total": {"amount": int(budget * 0.42), "currency": currency}
            },
            "deep_links": {
                "flight": "https://example.com/flight/sin",
                "hotel": "https://example.com/hotel/sin",
                "activities": [
                    "https://example.com/activity/gardens-bay",
                    "https://example.com/activity/sentosa"
                ]
            }
        }
    ]
    
    # Filter based on preferences
    filtered_destinations = []
    for dest in mock_destinations:
        if filters.halal and dest["signals"]["halal_index"] < 0.5:
            continue
        if filters.kids and "Kids-friendly" not in dest["badges"]:
            continue
        if filters.luxury and dest["sample_package"]["tier"] != "LUXURY":
            continue
        
        filtered_destinations.append(Top10Item(**dest))
    
    # Sort by popularity score and return top 10
    filtered_destinations.sort(key=lambda x: x.popularity_score, reverse=True)
    return filtered_destinations[:10]
