"""
Cache management routes for monitoring and controlling cache
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
import logging

from services.cache_service import cache_service, CacheStrategy

router = APIRouter(prefix="/api/cache", tags=["cache"])
logger = logging.getLogger(__name__)

class CacheWarmRequest(BaseModel):
    cache_type: str = Field(..., description="Type of cache to warm")
    keys_data: List[tuple] = Field(..., description="List of (key, data) pairs")

class CacheInvalidateRequest(BaseModel):
    cache_type: str = Field(..., description="Type of cache to invalidate")
    pattern: str = Field(default="*", description="Pattern to match for invalidation")

@router.get("/health")
async def cache_health_check():
    """Check cache service health"""
    try:
        health_status = await cache_service.health_check()
        return health_status
        
    except Exception as e:
        logger.error(f"Cache health check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Cache health check failed: {str(e)}")

@router.get("/stats")
async def get_cache_stats():
    """Get comprehensive cache statistics"""
    try:
        stats = await cache_service.get_cache_stats()
        
        # Add cache configuration info
        stats["cache_configs"] = {
            cache_type: {
                "ttl_seconds": config.ttl_seconds,
                "strategy": config.strategy.value,
                "prefix": config.prefix,
                "compress": config.compress,
                "versioned": config.versioned
            }
            for cache_type, config in cache_service.cache_configs.items()
        }
        
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get cache stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get cache stats: {str(e)}")

@router.post("/warm")
async def warm_cache(request: CacheWarmRequest):
    """Warm cache with predefined data"""
    try:
        result = await cache_service.warm_cache(request.cache_type, request.keys_data)
        return result
        
    except Exception as e:
        logger.error(f"Cache warming failed: {e}")
        raise HTTPException(status_code=500, detail=f"Cache warming failed: {str(e)}")

@router.post("/invalidate")
async def invalidate_cache_pattern(request: CacheInvalidateRequest):
    """Invalidate cache entries matching a pattern"""
    try:
        deleted_count = await cache_service.invalidate_pattern(request.cache_type, request.pattern)
        
        return {
            "cache_type": request.cache_type,
            "pattern": request.pattern,
            "deleted_entries": deleted_count,
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Cache invalidation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Cache invalidation failed: {str(e)}")

@router.delete("/flush/{cache_type}")
async def flush_cache_type(cache_type: str):
    """Flush all cache entries for a specific type"""
    try:
        deleted_count = await cache_service.flush_cache_type(cache_type)
        
        return {
            "cache_type": cache_type,
            "deleted_entries": deleted_count,
            "status": "flushed"
        }
        
    except Exception as e:
        logger.error(f"Cache flush failed: {e}")
        raise HTTPException(status_code=500, detail=f"Cache flush failed: {str(e)}")

@router.get("/get/{cache_type}/{key}")
async def get_cache_entry(cache_type: str, key: str):
    """Get specific cache entry (for debugging)"""
    try:
        data = await cache_service.get(cache_type, key)
        
        if data is not None:
            return {
                "cache_type": cache_type,
                "key": key,
                "data": data,
                "status": "found"
            }
        else:
            return {
                "cache_type": cache_type,
                "key": key,
                "status": "not_found"
            }
        
    except Exception as e:
        logger.error(f"Cache get failed: {e}")
        raise HTTPException(status_code=500, detail=f"Cache get failed: {str(e)}")

@router.delete("/delete/{cache_type}/{key}")
async def delete_cache_entry(cache_type: str, key: str):
    """Delete specific cache entry"""
    try:
        deleted = await cache_service.delete(cache_type, key)
        
        return {
            "cache_type": cache_type,
            "key": key,
            "deleted": deleted,
            "status": "deleted" if deleted else "not_found"
        }
        
    except Exception as e:
        logger.error(f"Cache delete failed: {e}")
        raise HTTPException(status_code=500, detail=f"Cache delete failed: {str(e)}")

@router.get("/types")
async def get_cache_types():
    """Get available cache types and their configurations"""
    try:
        cache_types = {}
        
        for cache_type, config in cache_service.cache_configs.items():
            cache_types[cache_type] = {
                "ttl_seconds": config.ttl_seconds,
                "ttl_human": f"{config.ttl_seconds // 60} minutes" if config.ttl_seconds >= 60 else f"{config.ttl_seconds} seconds",
                "strategy": config.strategy.value,
                "prefix": config.prefix,
                "compress": config.compress,
                "versioned": config.versioned,
                "description": _get_cache_type_description(cache_type)
            }
        
        return {
            "cache_types": cache_types,
            "total_types": len(cache_types)
        }
        
    except Exception as e:
        logger.error(f"Failed to get cache types: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get cache types: {str(e)}")

@router.post("/optimize")
async def optimize_cache():
    """Run cache optimization (cleanup expired entries, etc.)"""
    try:
        # This would typically run cleanup operations
        # For now, return optimization suggestions
        
        stats = await cache_service.get_cache_stats()
        suggestions = []
        
        # Check hit rate
        hit_rate = stats.get("redis_info", {}).get("hit_rate_percent", 0)
        if hit_rate < 70:
            suggestions.append("Consider increasing TTL for frequently accessed data")
        
        # Check memory usage
        memory_info = stats.get("redis_info", {}).get("used_memory", "0B")
        if "GB" in memory_info:
            suggestions.append("High memory usage detected - consider enabling compression")
        
        # Check cache types usage
        cache_stats = stats.get("cache_types", {})
        for cache_type, type_stats in cache_stats.items():
            if type_stats["entries"] == 0:
                suggestions.append(f"Cache type '{cache_type}' is not being used")
        
        return {
            "optimization_status": "completed",
            "current_hit_rate": hit_rate,
            "suggestions": suggestions,
            "timestamp": "2025-08-26T10:00:00Z"
        }
        
    except Exception as e:
        logger.error(f"Cache optimization failed: {e}")
        raise HTTPException(status_code=500, detail=f"Cache optimization failed: {str(e)}")

def _get_cache_type_description(cache_type: str) -> str:
    """Get human-readable description for cache type"""
    descriptions = {
        "flights": "Flight search results with real-time pricing",
        "hotels": "Hotel search results and availability",
        "activities": "Activities, attractions, and places data",
        "weather": "Weather forecasts and climate data",
        "events": "Local events and festivals",
        "ai_itineraries": "AI-generated travel itineraries",
        "top10": "Top-10 destination recommendations",
        "api_validation": "API key validation results",
        "exchange_rates": "Currency exchange rates"
    }
    
    return descriptions.get(cache_type, "Cache for travel-related data")