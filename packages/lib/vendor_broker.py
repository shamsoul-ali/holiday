"""
Vendor Broker - Intelligent provider selection for travel services

This module handles the logic for choosing the best travel service providers
based on context, region, partnerships, and performance metrics.
"""

from typing import Dict, Any, Optional, List
from enum import Enum
import asyncio
from dataclasses import dataclass

class Region(Enum):
    """Geographic regions for provider selection"""
    EU = "EU"
    APAC = "APAC"
    NA = "NA"
    SA = "SA"
    AF = "AF"
    OC = "OC"

class Market(Enum):
    """Market segments for provider selection"""
    BUDGET = "BUDGET"
    COMFORT = "COMFORT"
    LUXURY = "LUXURY"
    BUSINESS = "BUSINESS"

@dataclass
class ProviderContext:
    """Context for provider selection decisions"""
    region: Region
    market: Market
    budget: int
    currency: str
    passengers: int
    partner: Optional[Dict[str, Any]] = None
    affiliates: Optional[Dict[str, Any]] = None
    user_preferences: Optional[Dict[str, Any]] = None
    seasonality: Optional[Dict[str, Any]] = None

class VendorBroker:
    """
    Intelligent broker for selecting travel service providers
    """
    
    def __init__(self):
        self.provider_performance = {}
        self.region_affinities = {
            Region.EU: ["amadeus", "skyscanner", "rail_europe"],
            Region.APAC: ["amadeus", "kiwi", "klook", "expedia_rapid"],
            Region.NA: ["amadeus", "expedia_rapid", "duffel"],
            Region.SA: ["amadeus", "kiwi"],
            Region.AF: ["amadeus", "kiwi"],
            Region.OC: ["amadeus", "kiwi", "expedia_rapid"]
        }
    
    async def choose_flights_provider(self, ctx: ProviderContext) -> str:
        """
        Select the best flights provider based on context
        """
        # Check partner preferences first
        if ctx.partner and ctx.partner.get("duffel_enabled"):
            return "duffel"
        
        # Check affiliate partnerships
        if ctx.affiliates and ctx.affiliates.get("skyscanner"):
            if ctx.region in [Region.EU, Region.APAC]:
                return "skyscanner_redirect"
        
        # Default logic based on region and market
        if ctx.region == Region.EU:
            if ctx.market == Market.BUDGET:
                return "kiwi"
            return "amadeus"
        elif ctx.region == Region.APAC:
            if ctx.market == Market.BUDGET:
                return "kiwi"
            return "amadeus"
        elif ctx.region == Region.NA:
            if ctx.market == Market.BUDGET:
                return "expedia_rapid"
            return "amadeus"
        else:
            return "amadeus"
    
    async def choose_hotels_provider(self, ctx: ProviderContext) -> str:
        """
        Select the best hotels provider based on context
        """
        # Check affiliate partnerships
        if ctx.affiliates and ctx.affiliates.get("expedia"):
            return "expedia_rapid"
        
        # Check partner preferences
        if ctx.partner and ctx.partner.get("amadeus_hotels"):
            return "amadeus_hotel"
        
        # Default logic
        if ctx.region == Region.APAC and ctx.market == Market.LUXURY:
            return "amadeus_hotel"  # Better luxury inventory
        elif ctx.region == Region.NA:
            return "expedia_rapid"  # Strong NA presence
        else:
            return "amadeus_hotel"
    
    async def choose_activities_provider(self, ctx: ProviderContext) -> str:
        """
        Select the best activities provider based on context
        """
        # APAC market with Klook partnership
        if ctx.region == Region.APAC and ctx.affiliates and ctx.affiliates.get("klook"):
            return "klook"
        
        # Check GetYourGuide vs Viator based on region
        if ctx.region == Region.EU:
            return "getyourguide"  # Strong EU presence
        elif ctx.region == Region.NA:
            return "viator"  # Strong NA presence
        else:
            # Default to GetYourGuide for global coverage
            return "getyourguide"
    
    async def choose_rail_provider(self, ctx: ProviderContext) -> str:
        """
        Select the best rail provider based on context
        """
        if ctx.region == Region.EU:
            return "rail_europe"
        elif ctx.region == Region.APAC:
            # Could add APAC-specific rail providers here
            return "rail_europe"  # Default for now
        else:
            return "rail_europe"
    
    async def choose_transfer_provider(self, ctx: ProviderContext) -> str:
        """
        Select the best transfer provider based on context
        """
        # This could integrate with Uber, local taxi services, etc.
        if ctx.region == Region.NA:
            return "uber_deeplink"
        elif ctx.region == Region.EU:
            return "local_taxi"
        else:
            return "local_taxi"
    
    async def get_provider_ranking(
        self, 
        service_type: str, 
        ctx: ProviderContext
    ) -> List[Dict[str, Any]]:
        """
        Get ranked list of providers for a service type
        """
        primary_provider = await self._get_primary_provider(service_type, ctx)
        fallback_providers = await self._get_fallback_providers(service_type, ctx)
        
        ranking = [
            {
                "provider": primary_provider,
                "priority": "primary",
                "reason": "Best match for context"
            }
        ]
        
        for i, provider in enumerate(fallback_providers):
            ranking.append({
                "provider": provider,
                "priority": f"fallback_{i+1}",
                "reason": "Alternative option"
            })
        
        return ranking
    
    async def _get_primary_provider(self, service_type: str, ctx: ProviderContext) -> str:
        """Get the primary provider for a service type"""
        if service_type == "flights":
            return await self.choose_flights_provider(ctx)
        elif service_type == "hotels":
            return await self.choose_hotels_provider(ctx)
        elif service_type == "activities":
            return await self.choose_activities_provider(ctx)
        elif service_type == "rail":
            return await self.choose_rail_provider(ctx)
        elif service_type == "transfers":
            return await self.choose_transfer_provider(ctx)
        else:
            raise ValueError(f"Unknown service type: {service_type}")
    
    async def _get_fallback_providers(self, service_type: str, ctx: ProviderContext) -> List[str]:
        """Get fallback providers for a service type"""
        if service_type == "flights":
            return ["kiwi", "duffel"] if ctx.region != Region.EU else ["amadeus", "duffel"]
        elif service_type == "hotels":
            return ["amadeus_hotel", "expedia_rapid"]
        elif service_type == "activities":
            return ["viator", "klook"] if ctx.region == Region.APAC else ["getyourguide", "viator"]
        elif service_type == "rail":
            return ["amadeus"]  # Amadeus as fallback for rail
        else:
            return []
    
    async def update_performance_metrics(
        self, 
        provider: str, 
        service_type: str, 
        metrics: Dict[str, Any]
    ):
        """
        Update performance metrics for a provider
        """
        if provider not in self.provider_performance:
            self.provider_performance[provider] = {}
        
        if service_type not in self.provider_performance[provider]:
            self.provider_performance[provider][service_type] = {}
        
        self.provider_performance[provider][service_type].update(metrics)
    
    def get_provider_health(self, provider: str, service_type: str) -> Dict[str, Any]:
        """
        Get health metrics for a provider
        """
        if provider not in self.provider_performance:
            return {"status": "unknown", "last_check": None}
        
        if service_type not in self.provider_performance[provider]:
            return {"status": "unknown", "last_check": None}
        
        return self.provider_performance[provider][service_type]

# Global instance
vendor_broker = VendorBroker()

# Convenience functions
async def choose_flights_provider(ctx: ProviderContext) -> str:
    """Convenience function for choosing flights provider"""
    return await vendor_broker.choose_flights_provider(ctx)

async def choose_hotels_provider(ctx: ProviderContext) -> str:
    """Convenience function for choosing hotels provider"""
    return await vendor_broker.choose_hotels_provider(ctx)

async def choose_activities_provider(ctx: ProviderContext) -> str:
    """Convenience function for choosing activities provider"""
    return await vendor_broker.choose_activities_provider(ctx)

async def choose_rail_provider(ctx: ProviderContext) -> str:
    """Convenience function for choosing rail provider"""
    return await vendor_broker.choose_rail_provider(ctx)

async def get_provider_ranking(
    service_type: str, 
    ctx: ProviderContext
) -> List[Dict[str, Any]]:
    """Convenience function for getting provider ranking"""
    return await vendor_broker.get_provider_ranking(service_type, ctx)
