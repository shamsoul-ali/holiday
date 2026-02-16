import os
from typing import Dict, Optional, List
from pydantic import BaseModel, Field
import logging

logger = logging.getLogger(__name__)

class APIConfig(BaseModel):
    """Base API configuration model"""
    api_key: str
    api_secret: Optional[str] = None
    base_url: str
    enabled: bool = True
    rate_limit: Optional[int] = None
    timeout: int = 30

class GoogleAPIConfig(APIConfig):
    """Google APIs configuration"""
    project_id: Optional[str] = None
    billing_account: Optional[str] = None
    
class AmadeusConfig(APIConfig):
    """Amadeus API configuration"""
    environment: str = "test"  # test or production
    client_id: str = Field(alias="api_key")
    client_secret: str = Field(alias="api_secret")

class KiwiConfig(APIConfig):
    """Kiwi/Tequila API configuration"""
    partner_id: Optional[str] = None
    market: str = "MY"

class ExpediaConfig(APIConfig):
    """Expedia Rapid API configuration"""
    rapid_api_key: str = Field(alias="api_key")
    rapid_api_host: str = "expedia.p.rapidapi.com"

class SkyscannerConfig(APIConfig):
    """Skyscanner API configuration"""
    country: str = "MY"
    currency: str = "MYR"
    locale: str = "en-MY"

class TripAdvisorConfig(APIConfig):
    """TripAdvisor API configuration"""
    rapid_api_key: str = Field(alias="api_key")
    rapid_api_host: str = "tripadvisor1.p.rapidapi.com"

class OpenWeatherConfig(APIConfig):
    """OpenWeather API configuration"""
    units: str = "metric"
    language: str = "en"

class AIAPIConfig(APIConfig):
    """AI APIs configuration"""
    model: str = "gpt-4"
    max_tokens: int = 2000
    temperature: float = 0.7

class TravelAPIConfig:
    """Main travel API configuration manager"""
    
    def __init__(self):
        self.apis: Dict[str, APIConfig] = {}
        self.load_configuration()
    
    def load_configuration(self):
        """Load all API configurations from environment variables"""
        
        # Google APIs
        if os.getenv("GOOGLE_API_KEY"):
            self.apis["google_places"] = GoogleAPIConfig(
                api_key=os.getenv("GOOGLE_API_KEY"),
                base_url="https://maps.googleapis.com/maps/api",
                enabled=True
            )
            
            self.apis["google_travel"] = GoogleAPIConfig(
                api_key=os.getenv("GOOGLE_API_KEY"),
                base_url="https://travel.googleapis.com",
                enabled=True
            )
            
            self.apis["google_flights"] = GoogleAPIConfig(
                api_key=os.getenv("GOOGLE_API_KEY"),
                base_url="https://www.googleapis.com/qpxExpress/v1",
                enabled=True
            )
        
        # Amadeus
        if os.getenv("AMADEUS_CLIENT_ID") and os.getenv("AMADEUS_CLIENT_SECRET"):
            self.apis["amadeus"] = AmadeusConfig(
                client_id=os.getenv("AMADEUS_CLIENT_ID"),
                client_secret=os.getenv("AMADEUS_CLIENT_SECRET"),
                base_url="https://test.api.amadeus.com/v1" if os.getenv("AMADEUS_ENVIRONMENT") == "test" else "https://api.amadeus.com/v1",
                environment=os.getenv("AMADEUS_ENVIRONMENT", "test"),
                enabled=True
            )
        
        # Kiwi/Tequila
        if os.getenv("KIWI_API_KEY"):
            self.apis["kiwi"] = KiwiConfig(
                api_key=os.getenv("KIWI_API_KEY"),
                base_url="https://tequila-api.kiwi.com",
                partner_id=os.getenv("KIWI_PARTNER_ID"),
                market=os.getenv("KIWI_MARKET", "MY"),
                enabled=True
            )
        
        # Expedia
        if os.getenv("EXPEDIA_RAPID_API_KEY"):
            self.apis["expedia"] = ExpediaConfig(
                rapid_api_key=os.getenv("EXPEDIA_RAPID_API_KEY"),
                base_url="https://expedia.p.rapidapi.com",
                enabled=True
            )
        
        # Skyscanner
        if os.getenv("SKYSCANNER_API_KEY"):
            self.apis["skyscanner"] = SkyscannerConfig(
                api_key=os.getenv("SKYSCANNER_API_KEY"),
                base_url="https://partners.api.skyscanner.net/apiservices/v3",
                country=os.getenv("SKYSCANNER_COUNTRY", "MY"),
                currency=os.getenv("SKYSCANNER_CURRENCY", "MYR"),
                locale=os.getenv("SKYSCANNER_LOCALE", "en-MY"),
                enabled=True
            )
        
        # TripAdvisor
        if os.getenv("TRIPADVISOR_RAPID_API_KEY"):
            self.apis["tripadvisor"] = TripAdvisorConfig(
                rapid_api_key=os.getenv("TRIPADVISOR_RAPID_API_KEY"),
                base_url="https://tripadvisor1.p.rapidapi.com",
                enabled=True
            )
        
        # OpenWeather
        if os.getenv("OPENWEATHER_API_KEY"):
            self.apis["openweather"] = OpenWeatherConfig(
                api_key=os.getenv("OPENWEATHER_API_KEY"),
                base_url="https://api.openweathermap.org/data/2.5",
                units=os.getenv("OPENWEATHER_UNITS", "metric"),
                language=os.getenv("OPENWEATHER_LANGUAGE", "en"),
                enabled=True
            )
        
        # AI APIs
        if os.getenv("OPENAI_API_KEY"):
            self.apis["openai"] = AIAPIConfig(
                api_key=os.getenv("OPENAI_API_KEY"),
                base_url="https://api.openai.com/v1",
                model=os.getenv("OPENAI_MODEL", "gpt-4"),
                max_tokens=int(os.getenv("OPENAI_MAX_TOKENS", "2000")),
                temperature=float(os.getenv("OPENAI_TEMPERATURE", "0.7")),
                enabled=True
            )
        
        if os.getenv("ANTHROPIC_API_KEY"):
            self.apis["anthropic"] = AIAPIConfig(
                api_key=os.getenv("ANTHROPIC_API_KEY"),
                base_url="https://api.anthropic.com",
                model=os.getenv("ANTHROPIC_MODEL", "claude-3-sonnet-20240229"),
                max_tokens=int(os.getenv("ANTHROPIC_MAX_TOKENS", "2000")),
                temperature=float(os.getenv("ANTHROPIC_TEMPERATURE", "0.7")),
                enabled=True
            )
        
        # Log configuration status
        self.log_configuration_status()
    
    def log_configuration_status(self):
        """Log the status of all API configurations"""
        enabled_apis = [name for name, config in self.apis.items() if config.enabled]
        disabled_apis = [name for name, config in self.apis.items() if not config.enabled]
        
        logger.info(f"API Configuration Status:")
        logger.info(f"  Enabled APIs: {', '.join(enabled_apis) if enabled_apis else 'None'}")
        logger.info(f"  Disabled APIs: {', '.join(disabled_apis) if disabled_apis else 'None'}")
        
        if not enabled_apis:
            logger.warning("No APIs are currently enabled. Please check your environment variables.")
    
    def get_api_config(self, api_name: str) -> Optional[APIConfig]:
        """Get configuration for a specific API"""
        return self.apis.get(api_name)
    
    def is_api_enabled(self, api_name: str) -> bool:
        """Check if a specific API is enabled"""
        config = self.apis.get(api_name)
        return config is not None and config.enabled
    
    def get_enabled_apis(self) -> List[str]:
        """Get list of all enabled APIs"""
        return [name for name, config in self.apis.items() if config.enabled]
    
    def get_api_keys_summary(self) -> Dict[str, Dict[str, str]]:
        """Get a summary of API keys (masked for security)"""
        summary = {}
        for name, config in self.apis.items():
            if config.enabled:
                summary[name] = {
                    "status": "enabled",
                    "base_url": config.base_url,
                    "key_status": "configured" if config.api_key else "missing"
                }
            else:
                summary[name] = {
                    "status": "disabled",
                    "base_url": config.base_url,
                    "key_status": "not_configured"
                }
        return summary
    
    def validate_configuration(self) -> Dict[str, List[str]]:
        """Validate all API configurations and return any issues"""
        issues = {}
        
        for name, config in self.apis.items():
            if not config.enabled:
                continue
                
            if not config.api_key:
                if name not in issues:
                    issues[name] = []
                issues[name].append("API key is missing")
            
            if not config.base_url:
                if name not in issues:
                    issues[name] = []
                issues[name].append("Base URL is missing")
        
        return issues

# Global instance
api_config = TravelAPIConfig()

def get_api_config(api_name: str) -> Optional[APIConfig]:
    """Global function to get API configuration"""
    return api_config.get_api_config(api_name)

def is_api_enabled(api_name: str) -> bool:
    """Global function to check if API is enabled"""
    return api_config.is_api_enabled(api_name)

def get_enabled_apis() -> List[str]:
    """Global function to get list of enabled APIs"""
    return api_config.get_enabled_apis()
