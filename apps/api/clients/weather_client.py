"""
Weather API Client using OpenWeather and Open-Meteo
https://openweathermap.org/api
https://open-meteo.com/
"""

import os
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import httpx
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class WeatherClient:
    def __init__(self):
        self.openweather_key = os.getenv("OPENWEATHER_KEY")
        self.openmeteo_base = "https://api.open-meteo.com/v1"
        
        if not self.openweather_key:
            logger.warning("OpenWeather API key not configured")
    
    async def get_current_weather(
        self,
        latitude: float,
        longitude: float,
        units: str = "metric"
    ) -> Optional[Dict[str, Any]]:
        """Get current weather using OpenWeather API"""
        if not self.openweather_key:
            return None
        
        try:
            params = {
                "lat": latitude,
                "lon": longitude,
                "appid": self.openweather_key,
                "units": units
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.openweathermap.org/data/2.5/weather",
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_current_weather(data)
                
        except Exception as e:
            logger.error(f"OpenWeather current weather failed: {e}")
            return None
    
    async def get_forecast(
        self,
        latitude: float,
        longitude: float,
        days: int = 7,
        units: str = "metric"
    ) -> Optional[Dict[str, Any]]:
        """Get weather forecast using Open-Meteo API"""
        try:
            params = {
                "latitude": latitude,
                "longitude": longitude,
                "daily": "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode",
                "timezone": "auto",
                "forecast_days": days
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.openmeteo_base}/forecast",
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_forecast(data)
                
        except Exception as e:
            logger.error(f"Open-Meteo forecast failed: {e}")
            return None
    
    async def get_historical_weather(
        self,
        latitude: float,
        longitude: float,
        date: str,
        units: str = "metric"
    ) -> Optional[Dict[str, Any]]:
        """Get historical weather data using Open-Meteo API"""
        try:
            params = {
                "latitude": latitude,
                "longitude": longitude,
                "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode",
                "timezone": "auto",
                "start_date": date,
                "end_date": date
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.openmeteo_base}/forecast",
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_historical_weather(data)
                
        except Exception as e:
            logger.error(f"Open-Meteo historical weather failed: {e}")
            return None
    
    async def get_monthly_weather(
        self,
        latitude: float,
        longitude: float,
        year: int,
        month: int
    ) -> Optional[Dict[str, Any]]:
        """Get monthly weather statistics using Open-Meteo API"""
        try:
            # Get the first and last day of the month
            start_date = datetime(year, month, 1).strftime("%Y-%m-%d")
            if month == 12:
                end_date = datetime(year + 1, 1, 1) - timedelta(days=1)
            else:
                end_date = datetime(year, month + 1, 1) - timedelta(days=1)
            end_date = end_date.strftime("%Y-%m-%d")
            
            params = {
                "latitude": latitude,
                "longitude": longitude,
                "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode",
                "timezone": "auto",
                "start_date": start_date,
                "end_date": end_date
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.openmeteo_base}/forecast",
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                return self._parse_monthly_weather(data, year, month)
                
        except Exception as e:
            logger.error(f"Open-Meteo monthly weather failed: {e}")
            return None
    
    async def calculate_comfort_index(
        self,
        latitude: float,
        longitude: float,
        target_month: int,
        target_year: int = None
    ) -> Optional[float]:
        """Calculate weather comfort index for a specific month (0-1)"""
        if target_year is None:
            target_year = datetime.now().year
        
        try:
            monthly_data = await self.get_monthly_weather(latitude, longitude, target_year, target_month)
            if not monthly_data:
                return None
            
            # Calculate comfort based on temperature and precipitation
            avg_temp = monthly_data.get("average_temperature", 20)
            total_precip = monthly_data.get("total_precipitation", 0)
            sunny_days = monthly_data.get("sunny_days", 0)
            total_days = monthly_data.get("total_days", 30)
            
            # Temperature comfort (20-25°C is ideal)
            temp_score = 1.0 - min(abs(avg_temp - 22.5) / 15, 1.0)
            
            # Precipitation comfort (less is better)
            precip_score = max(1.0 - (total_precip / 200), 0.0)
            
            # Sunshine comfort
            sunshine_score = sunny_days / total_days if total_days > 0 else 0.5
            
            # Weighted comfort index
            comfort_index = (temp_score * 0.5 + precip_score * 0.3 + sunshine_score * 0.2)
            
            return round(comfort_index, 2)
            
        except Exception as e:
            logger.error(f"Comfort index calculation failed: {e}")
            return None
    
    def _parse_current_weather(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse OpenWeather current weather data"""
        try:
            main = data.get("main", {})
            weather = data.get("weather", [{}])[0]
            wind = data.get("wind", {})
            
            parsed_weather = {
                "temperature": {
                    "current": main.get("temp"),
                    "feels_like": main.get("feels_like"),
                    "min": main.get("temp_min"),
                    "max": main.get("temp_max")
                },
                "humidity": main.get("humidity"),
                "pressure": main.get("pressure"),
                "weather": {
                    "main": weather.get("main"),
                    "description": weather.get("description"),
                    "icon": weather.get("icon")
                },
                "wind": {
                    "speed": wind.get("speed"),
                    "direction": wind.get("deg")
                },
                "visibility": data.get("visibility"),
                "clouds": data.get("clouds", {}).get("all"),
                "sunrise": data.get("sys", {}).get("sunrise"),
                "sunset": data.get("sys", {}).get("sunset"),
                "timestamp": data.get("dt"),
                "source": "openweather"
            }
            
            return parsed_weather
            
        except Exception as e:
            logger.error(f"Failed to parse current weather: {e}")
            return {}
    
    def _parse_forecast(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse Open-Meteo forecast data"""
        try:
            daily = data.get("daily", {})
            time = daily.get("time", [])
            
            forecast_days = []
            for i in range(len(time)):
                day_forecast = {
                    "date": time[i],
                    "temperature": {
                        "max": daily.get("temperature_2m_max", [])[i],
                        "min": daily.get("temperature_2m_min", [])[i]
                    },
                    "precipitation_probability": daily.get("precipitation_probability_max", [])[i],
                    "weather_code": daily.get("weathercode", [])[i],
                    "weather_description": self._get_weather_description(daily.get("weathercode", [])[i])
                }
                forecast_days.append(day_forecast)
            
            return {
                "forecast": forecast_days,
                "source": "openmeteo"
            }
            
        except Exception as e:
            logger.error(f"Failed to parse forecast: {e}")
            return {}
    
    def _parse_historical_weather(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse Open-Meteo historical weather data"""
        try:
            daily = data.get("daily", {})
            time = daily.get("time", [])
            
            if not time:
                return {}
            
            # Get the first (and only) day
            day_data = {
                "date": time[0],
                "temperature": {
                    "max": daily.get("temperature_2m_max", [0])[0],
                    "min": daily.get("temperature_2m_min", [0])[0]
                },
                "precipitation": daily.get("precipitation_sum", [0])[0],
                "weather_code": daily.get("weathercode", [0])[0],
                "weather_description": self._get_weather_description(daily.get("weathercode", [0])[0])
            }
            
            return {
                "historical": day_data,
                "source": "openmeteo"
            }
            
        except Exception as e:
            logger.error(f"Failed to parse historical weather: {e}")
            return {}
    
    def _parse_monthly_weather(self, data: Dict[str, Any], year: int, month: int) -> Dict[str, Any]:
        """Parse Open-Meteo monthly weather data"""
        try:
            daily = data.get("daily", {})
            time = daily.get("time", [])
            temps_max = daily.get("temperature_2m_max", [])
            temps_min = daily.get("temperature_2m_min", [])
            precip = daily.get("precipitation_sum", [])
            weather_codes = daily.get("weathercode", [])
            
            if not time:
                return {}
            
            # Calculate statistics
            total_days = len(time)
            if total_days == 0:
                return {}
            
            avg_temp_max = sum(temps_max) / total_days if temps_max else 0
            avg_temp_min = sum(temps_min) / total_days if temps_min else 0
            avg_temp = (avg_temp_max + avg_temp_min) / 2
            total_precipitation = sum(precip) if precip else 0
            
            # Count sunny days (weather codes 0-3 are generally clear/sunny)
            sunny_days = sum(1 for code in weather_codes if code in [0, 1, 2, 3]) if weather_codes else 0
            
            return {
                "year": year,
                "month": month,
                "total_days": total_days,
                "average_temperature": round(avg_temp, 1),
                "average_temperature_max": round(avg_temp_max, 1),
                "average_temperature_min": round(avg_temp_min, 1),
                "total_precipitation": round(total_precipitation, 1),
                "sunny_days": sunny_days,
                "rainy_days": total_days - sunny_days,
                "source": "openmeteo"
            }
            
        except Exception as e:
            logger.error(f"Failed to parse monthly weather: {e}")
            return {}
    
    def _get_weather_description(self, code: int) -> str:
        """Convert WMO weather codes to descriptions"""
        weather_descriptions = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Foggy",
            48: "Depositing rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            71: "Slight snow",
            73: "Moderate snow",
            75: "Heavy snow",
            77: "Diamond dust",
            80: "Slight rain showers",
            81: "Moderate rain showers",
            82: "Violent rain showers",
            85: "Slight snow showers",
            86: "Heavy snow showers",
            95: "Thunderstorm",
            96: "Thunderstorm with slight hail",
            99: "Thunderstorm with heavy hail"
        }
        
        return weather_descriptions.get(code, "Unknown")

# Global instance
weather_client = WeatherClient()
