"""
Cache Service - Redis-based caching for API responses
Implements intelligent caching strategies for travel data
"""

import os
import json
import hashlib
import asyncio
from typing import Dict, List, Optional, Any, Union, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import logging

import redis.asyncio as redis
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class CacheStrategy(Enum):
    """Cache invalidation strategies"""
    TIME_BASED = "time_based"  # TTL-based expiration
    CONTENT_BASED = "content_based"  # Hash-based invalidation
    MANUAL = "manual"  # Manual invalidation
    HYBRID = "hybrid"  # Combination of strategies

@dataclass
class CacheConfig:
    """Cache configuration for different data types"""
    ttl_seconds: int
    strategy: CacheStrategy
    prefix: str
    compress: bool = False
    versioned: bool = False

class CacheService:
    def __init__(self):
        self.redis_client = None
        self._initialize_redis()
        self._setup_cache_configs()
    
    def _initialize_redis(self):
        """Initialize Redis connection"""
        try:
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            logger.info(f"Redis client initialized: {redis_url}")
        except Exception as e:
            logger.error(f"Redis initialization failed: {e}")
            self.redis_client = None
    
    def _setup_cache_configs(self):
        """Setup cache configurations for different data types"""
        self.cache_configs = {
            # Flight search results (frequently changing)
            "flights": CacheConfig(
                ttl_seconds=300,  # 5 minutes
                strategy=CacheStrategy.TIME_BASED,
                prefix="flights",
                compress=True
            ),
            
            # Hotel search results (moderately changing)
            "hotels": CacheConfig(
                ttl_seconds=1800,  # 30 minutes
                strategy=CacheStrategy.TIME_BASED,
                prefix="hotels",
                compress=True
            ),
            
            # Activity/places data (stable)
            "activities": CacheConfig(
                ttl_seconds=3600,  # 1 hour
                strategy=CacheStrategy.TIME_BASED,
                prefix="activities"
            ),
            
            # Weather data (moderately changing)
            "weather": CacheConfig(
                ttl_seconds=1800,  # 30 minutes
                strategy=CacheStrategy.TIME_BASED,
                prefix="weather"
            ),
            
            # Events data (stable for near future)
            "events": CacheConfig(
                ttl_seconds=7200,  # 2 hours
                strategy=CacheStrategy.TIME_BASED,
                prefix="events"
            ),
            
            # AI-generated itineraries (stable for same input)
            "ai_itineraries": CacheConfig(
                ttl_seconds=86400,  # 24 hours
                strategy=CacheStrategy.CONTENT_BASED,
                prefix="ai_itin",
                versioned=True
            ),
            
            # Top-10 destinations (stable)
            "top10": CacheConfig(
                ttl_seconds=3600,  # 1 hour
                strategy=CacheStrategy.TIME_BASED,
                prefix="top10"
            ),
            
            # API validation results (very stable)
            "api_validation": CacheConfig(
                ttl_seconds=3600,  # 1 hour
                strategy=CacheStrategy.TIME_BASED,
                prefix="api_val"
            ),
            
            # Currency exchange rates (stable)
            "exchange_rates": CacheConfig(
                ttl_seconds=3600,  # 1 hour
                strategy=CacheStrategy.TIME_BASED,
                prefix="fx_rates"
            )
        }
    
    async def get(self, cache_type: str, key: str) -> Optional[Dict[str, Any]]:
        """Get data from cache"""
        if not self.redis_client:
            return None
        
        config = self.cache_configs.get(cache_type)
        if not config:
            logger.warning(f"No cache config for type: {cache_type}")
            return None
        
        try:
            cache_key = self._build_cache_key(config.prefix, key)
            cached_data = await self.redis_client.get(cache_key)
            
            if cached_data:
                data = json.loads(cached_data)
                
                # Check if cache is still valid for content-based strategy
                if config.strategy == CacheStrategy.CONTENT_BASED:
                    if not self._is_content_valid(data, key):
                        await self.delete(cache_type, key)
                        return None
                
                # Log cache hit
                logger.debug(f"Cache HIT: {cache_type}:{key}")
                
                # Return data without metadata
                return data.get("data")
            
            logger.debug(f"Cache MISS: {cache_type}:{key}")
            return None
            
        except Exception as e:
            logger.error(f"Cache get failed for {cache_type}:{key}: {e}")
            return None
    
    async def set(
        self,
        cache_type: str,
        key: str,
        data: Dict[str, Any],
        custom_ttl: Optional[int] = None
    ) -> bool:
        """Set data in cache"""
        if not self.redis_client:
            return False
        
        config = self.cache_configs.get(cache_type)
        if not config:
            logger.warning(f"No cache config for type: {cache_type}")
            return False
        
        try:
            cache_key = self._build_cache_key(config.prefix, key)
            
            # Prepare cache entry with metadata
            cache_entry = {
                "data": data,
                "cached_at": datetime.now().isoformat(),
                "cache_type": cache_type,
                "ttl": custom_ttl or config.ttl_seconds
            }
            
            # Add content hash for content-based strategy
            if config.strategy == CacheStrategy.CONTENT_BASED:
                cache_entry["content_hash"] = self._generate_content_hash(data)
            
            # Add version for versioned cache
            if config.versioned:
                cache_entry["version"] = self._get_cache_version()
            
            # Serialize data
            serialized_data = json.dumps(cache_entry, default=str)
            
            # Compress if configured
            if config.compress:
                serialized_data = self._compress_data(serialized_data)
            
            # Set cache with TTL
            ttl = custom_ttl or config.ttl_seconds
            await self.redis_client.setex(cache_key, ttl, serialized_data)
            
            logger.debug(f"Cache SET: {cache_type}:{key} (TTL: {ttl}s)")
            return True
            
        except Exception as e:
            logger.error(f"Cache set failed for {cache_type}:{key}: {e}")
            return False
    
    async def delete(self, cache_type: str, key: str) -> bool:
        """Delete data from cache"""
        if not self.redis_client:
            return False
        
        config = self.cache_configs.get(cache_type)
        if not config:
            return False
        
        try:
            cache_key = self._build_cache_key(config.prefix, key)
            result = await self.redis_client.delete(cache_key)
            
            logger.debug(f"Cache DELETE: {cache_type}:{key}")
            return bool(result)
            
        except Exception as e:
            logger.error(f"Cache delete failed for {cache_type}:{key}: {e}")
            return False
    
    async def invalidate_pattern(self, cache_type: str, pattern: str) -> int:
        """Invalidate cache entries matching a pattern"""
        if not self.redis_client:
            return 0
        
        config = self.cache_configs.get(cache_type)
        if not config:
            return 0
        
        try:
            cache_pattern = self._build_cache_key(config.prefix, pattern)
            keys = await self.redis_client.keys(cache_pattern)
            
            if keys:
                deleted_count = await self.redis_client.delete(*keys)
                logger.info(f"Cache INVALIDATE: {cache_type} pattern '{pattern}' - {deleted_count} entries deleted")
                return deleted_count
            
            return 0
            
        except Exception as e:
            logger.error(f"Cache pattern invalidation failed for {cache_type}:{pattern}: {e}")
            return 0
    
    async def get_or_set(
        self,
        cache_type: str,
        key: str,
        fetch_function: Callable,
        *args,
        custom_ttl: Optional[int] = None,
        **kwargs
    ) -> Optional[Dict[str, Any]]:
        """Get from cache or fetch and set"""
        # Try to get from cache first
        cached_data = await self.get(cache_type, key)
        if cached_data is not None:
            return cached_data
        
        # Cache miss - fetch fresh data
        try:
            logger.debug(f"Cache FETCH: {cache_type}:{key}")
            
            # Call the fetch function
            if asyncio.iscoroutinefunction(fetch_function):
                fresh_data = await fetch_function(*args, **kwargs)
            else:
                fresh_data = fetch_function(*args, **kwargs)
            
            # Cache the fresh data
            if fresh_data is not None:
                await self.set(cache_type, key, fresh_data, custom_ttl)
            
            return fresh_data
            
        except Exception as e:
            logger.error(f"Cache fetch failed for {cache_type}:{key}: {e}")
            return None
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        if not self.redis_client:
            return {"error": "Redis not available"}
        
        try:
            stats = {}
            
            # Get general Redis info
            redis_info = await self.redis_client.info()
            stats["redis_info"] = {
                "connected_clients": redis_info.get("connected_clients", 0),
                "used_memory": redis_info.get("used_memory_human", "0B"),
                "keyspace_hits": redis_info.get("keyspace_hits", 0),
                "keyspace_misses": redis_info.get("keyspace_misses", 0)
            }
            
            # Calculate hit rate
            hits = redis_info.get("keyspace_hits", 0)
            misses = redis_info.get("keyspace_misses", 0)
            total_requests = hits + misses
            hit_rate = (hits / total_requests * 100) if total_requests > 0 else 0
            stats["redis_info"]["hit_rate_percent"] = round(hit_rate, 2)
            
            # Get cache type statistics
            cache_stats = {}
            for cache_type, config in self.cache_configs.items():
                pattern = f"{config.prefix}:*"
                keys = await self.redis_client.keys(pattern)
                cache_stats[cache_type] = {
                    "entries": len(keys),
                    "ttl": config.ttl_seconds,
                    "strategy": config.strategy.value
                }
            
            stats["cache_types"] = cache_stats
            stats["timestamp"] = datetime.now().isoformat()
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get cache stats: {e}")
            return {"error": f"Failed to get cache stats: {str(e)}"}
    
    async def warm_cache(self, cache_type: str, keys_data: List[tuple]) -> Dict[str, Any]:
        """Warm cache with multiple key-value pairs"""
        if not self.redis_client:
            return {"error": "Redis not available"}
        
        config = self.cache_configs.get(cache_type)
        if not config:
            return {"error": f"No cache config for type: {cache_type}"}
        
        success_count = 0
        error_count = 0
        
        try:
            for key, data in keys_data:
                try:
                    success = await self.set(cache_type, key, data)
                    if success:
                        success_count += 1
                    else:
                        error_count += 1
                except Exception as e:
                    logger.error(f"Failed to warm cache for {key}: {e}")
                    error_count += 1
            
            return {
                "cache_type": cache_type,
                "total_keys": len(keys_data),
                "successful": success_count,
                "failed": error_count,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Cache warming failed for {cache_type}: {e}")
            return {"error": f"Cache warming failed: {str(e)}"}
    
    async def flush_cache_type(self, cache_type: str) -> Dict[str, Any]:
        """Flush all cache entries for a specific type"""
        return await self.invalidate_pattern(cache_type, "*")
    
    async def health_check(self) -> Dict[str, Any]:
        """Check cache service health"""
        if not self.redis_client:
            return {
                "status": "unhealthy",
                "redis_available": False,
                "error": "Redis client not initialized"
            }
        
        try:
            # Test Redis connectivity
            await self.redis_client.ping()
            
            # Get basic stats
            stats = await self.get_cache_stats()
            
            return {
                "status": "healthy",
                "redis_available": True,
                "cache_types_configured": len(self.cache_configs),
                "redis_memory": stats.get("redis_info", {}).get("used_memory", "unknown"),
                "hit_rate": stats.get("redis_info", {}).get("hit_rate_percent", 0),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Cache health check failed: {e}")
            return {
                "status": "unhealthy",
                "redis_available": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def _build_cache_key(self, prefix: str, key: str) -> str:
        """Build cache key with prefix"""
        return f"holidayai:{prefix}:{key}"
    
    def _generate_content_hash(self, data: Dict[str, Any]) -> str:
        """Generate hash for content-based caching"""
        content_str = json.dumps(data, sort_keys=True, default=str)
        return hashlib.sha256(content_str.encode()).hexdigest()[:16]
    
    def _is_content_valid(self, cached_entry: Dict[str, Any], key: str) -> bool:
        """Check if cached content is still valid"""
        if "content_hash" not in cached_entry:
            return True  # Fallback to time-based if no hash
        
        # For now, assume content is valid
        # In production, you might compare with source data hash
        return True
    
    def _get_cache_version(self) -> str:
        """Get current cache version (for versioned caching)"""
        # Could be based on app version, config changes, etc.
        return "v1.0"
    
    def _compress_data(self, data: str) -> str:
        """Compress data if needed"""
        # For now, return as-is
        # In production, you might use gzip compression for large data
        return data

# Create cache decorators for easy usage
def cache_response(cache_type: str, ttl: Optional[int] = None):
    """Decorator to cache function responses"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            key_data = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            cache_key = hashlib.sha256(key_data.encode()).hexdigest()[:16]
            
            # Use cache service
            result = await cache_service.get_or_set(
                cache_type, cache_key, func, *args, custom_ttl=ttl, **kwargs
            )
            
            return result
        return wrapper
    return decorator

# Global instance
cache_service = CacheService()