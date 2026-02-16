"""
API Key Configuration and Validation
Centralized management for all external API keys with validation
"""

import os
from typing import Dict, Optional, List, Tuple
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class APIProvider(Enum):
    # AI & ML
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    
    # Travel Search
    AMADEUS = "amadeus"
    KIWI = "kiwi"
    SKYSCANNER = "skyscanner"
    DUFFEL = "duffel"
    
    # Hotels
    EXPEDIA_RAPID = "expedia_rapid"
    BOOKING = "booking"
    
    # Activities
    GETYOURGUIDE = "getyourguide"
    VIATOR = "viator"
    KLOOK = "klook"
    
    # Weather & Events
    OPENWEATHER = "openweather"
    TICKETMASTER = "ticketmaster"
    
    # Payments
    STRIPE = "stripe"
    IPAY88 = "ipay88"
    
    # Google Services
    GOOGLE_PLACES = "google_places"
    GOOGLE_MAPS = "google_maps"

@dataclass
class APIKeyConfig:
    provider: APIProvider
    key: Optional[str]
    secret: Optional[str] = None
    additional_config: Dict[str, str] = None
    is_required: bool = True
    is_valid: bool = False
    validation_endpoint: Optional[str] = None

class APIKeyManager:
    def __init__(self):
        self.api_configs: Dict[APIProvider, APIKeyConfig] = {}
        self._load_configurations()
    
    def _load_configurations(self):
        """Load API configurations from environment variables"""
        configs = [
            # AI & ML
            APIKeyConfig(
                provider=APIProvider.OPENAI,
                key=os.getenv("OPENAI_API_KEY"),
                is_required=True,
                validation_endpoint="https://api.openai.com/v1/models"
            ),
            APIKeyConfig(
                provider=APIProvider.ANTHROPIC,
                key=os.getenv("ANTHROPIC_API_KEY"),
                is_required=False,  # Fallback option
                validation_endpoint="https://api.anthropic.com/v1/messages"
            ),
            
            # Travel Search
            APIKeyConfig(
                provider=APIProvider.AMADEUS,
                key=os.getenv("AMADEUS_CLIENT_ID"),
                secret=os.getenv("AMADEUS_CLIENT_SECRET"),
                additional_config={"environment": os.getenv("AMADEUS_ENVIRONMENT", "test")},
                is_required=True,
                validation_endpoint="https://test.api.amadeus.com/v1/security/oauth2/token"
            ),
            APIKeyConfig(
                provider=APIProvider.KIWI,
                key=os.getenv("KIWI_API_KEY"),
                additional_config={"partner_id": os.getenv("KIWI_PARTNER_ID")},
                is_required=True
            ),
            APIKeyConfig(
                provider=APIProvider.SKYSCANNER,
                key=os.getenv("SKYSCANNER_API_KEY"),
                is_required=False
            ),
            APIKeyConfig(
                provider=APIProvider.DUFFEL,
                key=os.getenv("DUFFEL_API_KEY"),
                is_required=False
            ),
            
            # Hotels
            APIKeyConfig(
                provider=APIProvider.EXPEDIA_RAPID,
                key=os.getenv("EXPEDIA_RAPID_API_KEY"),
                is_required=True
            ),
            
            # Activities
            APIKeyConfig(
                provider=APIProvider.GETYOURGUIDE,
                key=os.getenv("GETYOURGUIDE_API_KEY"),
                is_required=True
            ),
            APIKeyConfig(
                provider=APIProvider.VIATOR,
                key=os.getenv("VIATOR_API_KEY"),
                is_required=True
            ),
            APIKeyConfig(
                provider=APIProvider.KLOOK,
                key=os.getenv("KLOOK_API_KEY"),
                is_required=False  # APAC specific
            ),
            
            # Weather & Events
            APIKeyConfig(
                provider=APIProvider.OPENWEATHER,
                key=os.getenv("OPENWEATHER_API_KEY"),
                is_required=True,
                validation_endpoint="https://api.openweathermap.org/data/2.5/weather"
            ),
            APIKeyConfig(
                provider=APIProvider.TICKETMASTER,
                key=os.getenv("TICKETMASTER_API_KEY"),
                is_required=False
            ),
            
            # Payments
            APIKeyConfig(
                provider=APIProvider.STRIPE,
                key=os.getenv("STRIPE_PUBLISHABLE_KEY"),
                secret=os.getenv("STRIPE_SECRET_KEY"),
                additional_config={"webhook_secret": os.getenv("STRIPE_WEBHOOK_SECRET")},
                is_required=True
            ),
            APIKeyConfig(
                provider=APIProvider.IPAY88,
                key=os.getenv("IPAY88_MERCHANT_KEY"),
                secret=os.getenv("IPAY88_MERCHANT_CODE"),
                additional_config={"signature_key": os.getenv("IPAY88_SIGNATURE_KEY")},
                is_required=False  # Malaysia specific
            ),
            
            # Google Services
            APIKeyConfig(
                provider=APIProvider.GOOGLE_PLACES,
                key=os.getenv("GOOGLE_PLACES_API_KEY"),
                is_required=True,
                validation_endpoint="https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
            ),
            APIKeyConfig(
                provider=APIProvider.GOOGLE_MAPS,
                key=os.getenv("GOOGLE_MAPS_API_KEY"),
                is_required=True
            ),
        ]
        
        for config in configs:
            self.api_configs[config.provider] = config
    
    async def validate_all_keys(self) -> Dict[str, Dict[str, any]]:
        """Validate all API keys and return status report"""
        validation_results = {}
        
        for provider, config in self.api_configs.items():
            result = await self._validate_single_key(config)
            validation_results[provider.value] = {
                "is_configured": bool(config.key),
                "is_valid": result,
                "is_required": config.is_required,
                "status": "✅ Valid" if result else ("❌ Invalid" if config.key else "⚠️ Not Configured")
            }
        
        return validation_results
    
    async def _validate_single_key(self, config: APIKeyConfig) -> bool:
        """Validate a single API key"""
        if not config.key:
            return False
        
        try:
            # Special validation for different providers
            if config.provider == APIProvider.OPENAI:
                return await self._validate_openai_key(config)
            elif config.provider == APIProvider.AMADEUS:
                return await self._validate_amadeus_key(config)
            elif config.provider == APIProvider.OPENWEATHER:
                return await self._validate_openweather_key(config)
            elif config.provider == APIProvider.STRIPE:
                return await self._validate_stripe_key(config)
            else:
                # Generic key format validation
                return len(config.key) > 10 and not config.key.startswith("your_")
                
        except Exception as e:
            logger.error(f"Validation failed for {config.provider.value}: {e}")
            return False
    
    async def _validate_openai_key(self, config: APIKeyConfig) -> bool:
        """Validate OpenAI API key"""
        import httpx
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.openai.com/v1/models",
                    headers={"Authorization": f"Bearer {config.key}"},
                    timeout=10.0
                )
                return response.status_code == 200
        except:
            return False
    
    async def _validate_amadeus_key(self, config: APIKeyConfig) -> bool:
        """Validate Amadeus API key"""
        import httpx
        
        if not config.secret:
            return False
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://test.api.amadeus.com/v1/security/oauth2/token",
                    data={
                        "grant_type": "client_credentials",
                        "client_id": config.key,
                        "client_secret": config.secret
                    },
                    timeout=10.0
                )
                return response.status_code == 200
        except:
            return False
    
    async def _validate_openweather_key(self, config: APIKeyConfig) -> bool:
        """Validate OpenWeather API key"""
        import httpx
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://api.openweathermap.org/data/2.5/weather?q=London&appid={config.key}",
                    timeout=10.0
                )
                return response.status_code == 200
        except:
            return False
    
    async def _validate_stripe_key(self, config: APIKeyConfig) -> bool:
        """Validate Stripe API key"""
        if not config.secret:
            return False
        
        import httpx
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.stripe.com/v1/account",
                    headers={"Authorization": f"Bearer {config.secret}"},
                    timeout=10.0
                )
                return response.status_code == 200
        except:
            return False
    
    def get_config(self, provider: APIProvider) -> Optional[APIKeyConfig]:
        """Get configuration for a specific provider"""
        return self.api_configs.get(provider)
    
    def is_provider_available(self, provider: APIProvider) -> bool:
        """Check if a provider is configured and available"""
        config = self.get_config(provider)
        return config and bool(config.key)
    
    def get_missing_required_keys(self) -> List[APIProvider]:
        """Get list of required API keys that are missing"""
        missing = []
        for provider, config in self.api_configs.items():
            if config.is_required and not config.key:
                missing.append(provider)
        return missing
    
    def generate_env_template(self) -> str:
        """Generate .env template with all required API keys"""
        template_lines = [
            "# =============================================================================",
            "# API KEYS CONFIGURATION - HOLIDAY AI PLATFORM",
            "# =============================================================================",
            "",
            "# IMPORTANT: Replace 'your_*_here' with actual API keys",
            ""
        ]
        
        categories = {
            "AI & MACHINE LEARNING": [APIProvider.OPENAI, APIProvider.ANTHROPIC],
            "TRAVEL SEARCH APIs": [APIProvider.AMADEUS, APIProvider.KIWI, APIProvider.SKYSCANNER, APIProvider.DUFFEL],
            "HOTEL APIs": [APIProvider.EXPEDIA_RAPID, APIProvider.BOOKING],
            "ACTIVITY APIs": [APIProvider.GETYOURGUIDE, APIProvider.VIATOR, APIProvider.KLOOK],
            "WEATHER & EVENTS": [APIProvider.OPENWEATHER, APIProvider.TICKETMASTER],
            "PAYMENT PROCESSING": [APIProvider.STRIPE, APIProvider.IPAY88],
            "GOOGLE SERVICES": [APIProvider.GOOGLE_PLACES, APIProvider.GOOGLE_MAPS]
        }
        
        for category, providers in categories.items():
            template_lines.append(f"# {category}")
            template_lines.append("# " + "="*50)
            
            for provider in providers:
                config = self.get_config(provider)
                if config:
                    required_marker = " # REQUIRED" if config.is_required else " # OPTIONAL"
                    
                    if provider == APIProvider.OPENAI:
                        template_lines.append(f"OPENAI_API_KEY=your_openai_key_here{required_marker}")
                    elif provider == APIProvider.ANTHROPIC:
                        template_lines.append(f"ANTHROPIC_API_KEY=your_anthropic_key_here{required_marker}")
                    elif provider == APIProvider.AMADEUS:
                        template_lines.append(f"AMADEUS_CLIENT_ID=your_amadeus_client_id{required_marker}")
                        template_lines.append(f"AMADEUS_CLIENT_SECRET=your_amadeus_client_secret{required_marker}")
                        template_lines.append("AMADEUS_ENVIRONMENT=test  # test or production")
                    # Add other providers...
            
            template_lines.append("")
        
        return "\n".join(template_lines)

# Global instance
api_key_manager = APIKeyManager()