from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
from datetime import date
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/umrah", tags=["Umrah"])

class UmrahPackage(BaseModel):
    package_id: str
    name: str
    duration_days: int
    price_per_person: float
    currency: str = "MYR"
    accommodation_type: str  # "5-star", "4-star", "3-star", "budget"
    distance_from_haram: float  # km from Masjid al-Haram
    halal_certified: bool
    prayer_facilities: List[str]  # ["qibla_direction", "prayer_room", "adhan_service"]
    included_services: List[str]
    highlights: List[str]
    restrictions: Optional[List[str]] = None
    availability: List[date]
    group_size: Optional[int] = None
    guide_language: List[str]
    transportation: str
    visa_assistance: bool
    insurance_included: bool

class UmrahSearchRequest(BaseModel):
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    currency: str = "MYR"
    duration_min: Optional[int] = None
    duration_max: Optional[int] = None
    accommodation_type: Optional[str] = None
    halal_certified: bool = True
    group_size: Optional[int] = None
    preferred_dates: Optional[List[date]] = None
    guide_language: Optional[List[str]] = None
    include_visa: bool = True
    include_insurance: bool = True

class UmrahSearchResponse(BaseModel):
    packages: List[UmrahPackage]
    total_count: int
    filters_applied: UmrahSearchRequest
    search_summary: str

@router.get("/packages", response_model=UmrahSearchResponse)
async def search_umrah_packages(
    budget: Optional[float] = Query(None, description="Maximum budget per person"),
    currency: str = Query("MYR", description="Currency for pricing"),
    pax: int = Query(1, description="Number of passengers"),
    preferences: Optional[str] = Query(None, description="Comma-separated preferences")
):
    """
    Search for Umrah travel packages with comprehensive filtering options.
    """
    try:
        # Parse preferences
        halal = "halal" in (preferences or "").lower()
        luxury = "luxury" in (preferences or "").lower()
        budget_friendly = "budget" in (preferences or "").lower()
        
        # Mock data - in production, this would query the database
        packages = [
            UmrahPackage(
                package_id="UMR001",
                name="Premium Umrah Package - 5 Star",
                duration_days=14,
                price_per_person=8500.0,
                currency=currency,
                accommodation_type="5-star",
                distance_from_haram=0.8,
                halal_certified=True,
                prayer_facilities=["qibla_direction", "prayer_room", "adhan_service", "tahajjud_room"],
                included_services=["return_flights", "hotel_accommodation", "transportation", "visa", "insurance", "guide"],
                highlights=["Direct flights from KL", "Walking distance to Haram", "Halal certified restaurants", "24/7 religious guidance"],
                restrictions=["Valid passport required", "Vaccination certificates"],
                availability=[date(2025, 12, 1), date(2025, 12, 15), date(2026, 1, 1)],
                group_size=20,
                guide_language=["Malay", "English", "Arabic"],
                transportation="Air-conditioned coach",
                visa_assistance=True,
                insurance_included=True
            ),
            UmrahPackage(
                package_id="UMR002",
                name="Comfort Umrah Package - 4 Star",
                duration_days=12,
                price_per_person=6500.0,
                currency=currency,
                accommodation_type="4-star",
                distance_from_haram=1.2,
                halal_certified=True,
                prayer_facilities=["qibla_direction", "prayer_room", "adhan_service"],
                included_services=["return_flights", "hotel_accommodation", "transportation", "visa", "guide"],
                highlights=["Quality accommodation", "Shuttle service to Haram", "Halal dining options", "Religious guidance"],
                restrictions=["Valid passport required"],
                availability=[date(2025, 12, 10), date(2026, 1, 10)],
                group_size=25,
                guide_language=["Malay", "English"],
                transportation="Air-conditioned coach",
                visa_assistance=True,
                insurance_included=False
            ),
            UmrahPackage(
                package_id="UMR003",
                name="Budget Umrah Package - 3 Star",
                duration_days=10,
                price_per_person=4500.0,
                currency=currency,
                accommodation_type="3-star",
                distance_from_haram=2.0,
                halal_certified=True,
                prayer_facilities=["qibla_direction", "prayer_room"],
                included_services=["return_flights", "hotel_accommodation", "transportation", "visa"],
                highlights=["Affordable pricing", "Basic amenities", "Halal food available", "Group travel"],
                restrictions=["Valid passport required", "Basic fitness level"],
                availability=[date(2025, 12, 5), date(2025, 12, 20)],
                group_size=30,
                guide_language=["Malay"],
                transportation="Air-conditioned coach",
                visa_assistance=True,
                insurance_included=False
            )
        ]
        
        # Apply budget filter
        if budget:
            packages = [p for p in packages if p.price_per_person <= budget]
        
        # Apply halal filter
        if halal:
            packages = [p for p in packages if p.halal_certified]
        
        # Apply luxury filter
        if luxury:
            packages = [p for p in packages if "5-star" in p.accommodation_type]
        
        # Apply budget filter
        if budget_friendly:
            packages = [p for p in packages if "3-star" in p.accommodation_type or "budget" in p.accommodation_type]
        
        return UmrahSearchResponse(
            packages=packages,
            total_count=len(packages),
            filters_applied=UmrahSearchRequest(
                budget_max=budget,
                currency=currency,
                halal_certified=halal
            ),
            search_summary=f"Found {len(packages)} Umrah packages matching your criteria"
        )
        
    except Exception as e:
        logger.error(f"Error searching Umrah packages: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to search Umrah packages")

@router.get("/packages/{package_id}", response_model=UmrahPackage)
async def get_umrah_package(package_id: str):
    """
    Get detailed information about a specific Umrah package.
    """
    try:
        # Mock data - in production, this would query the database
        packages = {
            "UMR001": UmrahPackage(
                package_id="UMR001",
                name="Premium Umrah Package - 5 Star",
                duration_days=14,
                price_per_person=8500.0,
                currency="MYR",
                accommodation_type="5-star",
                distance_from_haram=0.8,
                halal_certified=True,
                prayer_facilities=["qibla_direction", "prayer_room", "adhan_service", "tahajjud_room"],
                included_services=["return_flights", "hotel_accommodation", "transportation", "visa", "insurance", "guide"],
                highlights=["Direct flights from KL", "Walking distance to Haram", "Halal certified restaurants", "24/7 religious guidance"],
                restrictions=["Valid passport required", "Vaccination certificates"],
                availability=[date(2025, 12, 1), date(2025, 12, 15), date(2026, 1, 1)],
                group_size=20,
                guide_language=["Malay", "English", "Arabic"],
                transportation="Air-conditioned coach",
                visa_assistance=True,
                insurance_included=True
            )
        }
        
        if package_id not in packages:
            raise HTTPException(status_code=404, detail="Umrah package not found")
            
        return packages[package_id]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting Umrah package {package_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get Umrah package")

@router.get("/destinations")
async def get_umrah_destinations():
    """
    Get list of Umrah destinations and their details.
    """
    try:
        destinations = [
            {
                "city": "Mecca",
                "country": "Saudi Arabia",
                "highlights": ["Masjid al-Haram", "Kaaba", "Zamzam Well", "Mount Arafat"],
                "best_time": ["Ramadan", "Dhul Hijjah"],
                "visa_requirements": "Umrah visa required",
                "transportation": "Direct flights from KL available"
            },
            {
                "city": "Medina",
                "country": "Saudi Arabia", 
                "highlights": ["Masjid an-Nabawi", "Quba Mosque", "Mount Uhud", "Qiblatain Mosque"],
                "best_time": ["Year-round"],
                "visa_requirements": "Included in Umrah visa",
                "transportation": "Connected to Mecca by high-speed rail"
            }
        ]
        
        return {"destinations": destinations}
        
    except Exception as e:
        logger.error(f"Error getting Umrah destinations: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get Umrah destinations")

@router.get("/guidelines")
async def get_umrah_guidelines():
    """
    Get comprehensive Umrah travel guidelines and requirements.
    """
    try:
        guidelines = {
            "visa_requirements": [
                "Valid passport with 6 months validity",
                "Completed Umrah visa application",
                "Vaccination certificates (COVID-19, Meningitis)",
                "Passport-size photographs",
                "Travel insurance"
            ],
            "what_to_pack": [
                "Ihram clothing (2 sets)",
                "Comfortable walking shoes",
                "Prayer mat",
                "Personal hygiene items",
                "Medications",
                "Lightweight clothing"
            ],
            "etiquette": [
                "Respect local customs and traditions",
                "Dress modestly",
                "Follow prayer times",
                "Be patient and respectful",
                "Learn basic Arabic phrases"
            ],
            "health_tips": [
                "Stay hydrated",
                "Wear comfortable shoes",
                "Take regular breaks",
                "Follow COVID-19 protocols",
                "Carry necessary medications"
            ]
        }
        
        return guidelines
        
    except Exception as e:
        logger.error(f"Error getting Umrah guidelines: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get Umrah guidelines")
