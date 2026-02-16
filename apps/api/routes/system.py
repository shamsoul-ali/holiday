"""
System management routes for API key validation and health checks
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
import asyncio
from config.api_keys import api_key_manager, APIProvider

router = APIRouter(prefix="/api/system", tags=["system"])

@router.get("/health")
async def detailed_health_check():
    """Comprehensive health check including API key validation"""
    try:
        # Validate all API keys
        api_validation = await api_key_manager.validate_all_keys()
        
        # Check required services
        required_keys = api_key_manager.get_missing_required_keys()
        missing_required = [key.value for key in required_keys]
        
        # Calculate health score
        total_keys = len(api_key_manager.api_configs)
        valid_keys = sum(1 for result in api_validation.values() if result["is_valid"])
        health_score = (valid_keys / total_keys) * 100 if total_keys > 0 else 0
        
        # Determine overall status
        if missing_required:
            status = "degraded"
            message = f"Missing required API keys: {', '.join(missing_required)}"
        elif health_score >= 80:
            status = "healthy"
            message = "All critical systems operational"
        elif health_score >= 50:
            status = "warning"
            message = "Some optional services unavailable"
        else:
            status = "critical"
            message = "Multiple API integrations failing"
        
        return {
            "status": status,
            "message": message,
            "health_score": round(health_score, 1),
            "service": "holiday-ai-planner-api",
            "version": "0.1.0",
            "api_keys": api_validation,
            "missing_required": missing_required,
            "timestamp": "2025-08-26T10:00:00Z"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@router.get("/api-keys/status")
async def api_keys_status():
    """Get detailed status of all API key configurations"""
    try:
        validation_results = await api_key_manager.validate_all_keys()
        
        # Group by category for better organization
        categorized_results = {
            "ai_ml": {
                "openai": validation_results.get("openai", {}),
                "anthropic": validation_results.get("anthropic", {})
            },
            "travel_search": {
                "amadeus": validation_results.get("amadeus", {}),
                "kiwi": validation_results.get("kiwi", {}),
                "skyscanner": validation_results.get("skyscanner", {}),
                "duffel": validation_results.get("duffel", {})
            },
            "hotels": {
                "expedia_rapid": validation_results.get("expedia_rapid", {})
            },
            "activities": {
                "getyourguide": validation_results.get("getyourguide", {}),
                "viator": validation_results.get("viator", {}),
                "klook": validation_results.get("klook", {})
            },
            "weather_events": {
                "openweather": validation_results.get("openweather", {}),
                "ticketmaster": validation_results.get("ticketmaster", {})
            },
            "payments": {
                "stripe": validation_results.get("stripe", {}),
                "ipay88": validation_results.get("ipay88", {})
            },
            "google": {
                "google_places": validation_results.get("google_places", {}),
                "google_maps": validation_results.get("google_maps", {})
            }
        }
        
        return {
            "summary": {
                "total_providers": len(validation_results),
                "configured": sum(1 for r in validation_results.values() if r["is_configured"]),
                "valid": sum(1 for r in validation_results.values() if r["is_valid"]),
                "required_missing": len(api_key_manager.get_missing_required_keys())
            },
            "categories": categorized_results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"API key status check failed: {str(e)}")

@router.post("/api-keys/validate")
async def validate_api_keys():
    """Force validation of all API keys"""
    try:
        validation_results = await api_key_manager.validate_all_keys()
        
        failed_validations = [
            provider for provider, result in validation_results.items() 
            if result["is_configured"] and not result["is_valid"]
        ]
        
        return {
            "validation_completed": True,
            "total_keys": len(validation_results),
            "valid_keys": sum(1 for r in validation_results.values() if r["is_valid"]),
            "failed_validations": failed_validations,
            "results": validation_results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"API key validation failed: {str(e)}")

@router.get("/env-template")
async def get_env_template():
    """Generate .env template with all required API keys"""
    try:
        template = api_key_manager.generate_env_template()
        
        return {
            "template": template,
            "instructions": [
                "1. Copy the template below to your .env file",
                "2. Replace 'your_*_here' with actual API keys",
                "3. Required keys are marked with # REQUIRED",
                "4. Optional keys can be left as placeholders",
                "5. Restart the API server after updating keys"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Template generation failed: {str(e)}")

@router.get("/startup-check")
async def startup_check():
    """Check if the platform is ready for operation"""
    try:
        missing_required = api_key_manager.get_missing_required_keys()
        
        if missing_required:
            return {
                "ready": False,
                "status": "Missing required API keys",
                "missing_keys": [key.value for key in missing_required],
                "actions_needed": [
                    "Configure missing required API keys in .env file",
                    "Run /api/system/api-keys/validate to verify",
                    "Restart the API server"
                ]
            }
        
        # Validate critical keys
        critical_providers = [APIProvider.OPENAI, APIProvider.AMADEUS, APIProvider.OPENWEATHER]
        validation_tasks = []
        
        for provider in critical_providers:
            config = api_key_manager.get_config(provider)
            if config and config.key:
                validation_tasks.append(api_key_manager._validate_single_key(config))
        
        if validation_tasks:
            validation_results = await asyncio.gather(*validation_tasks, return_exceptions=True)
            valid_critical = sum(1 for r in validation_results if r is True)
        else:
            valid_critical = 0
        
        ready = valid_critical >= 2  # At least 2 critical services working
        
        return {
            "ready": ready,
            "status": "Ready for operation" if ready else "Some critical services unavailable",
            "critical_services_available": valid_critical,
            "critical_services_total": len(critical_providers),
            "recommendation": "Platform ready to serve requests" if ready else "Configure more API keys for full functionality"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Startup check failed: {str(e)}")