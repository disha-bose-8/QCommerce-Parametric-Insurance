# app/services/weather_service.py
import httpx

async def check_live_weather():
    # For now, this is a mock. Later, use httpx.get("OpenWeatherMap_URL")
    # Simulation: 10% chance of rain every check
    import random
    rain_val = random.uniform(0, 1)
    return {"rain": rain_val, "confirmed": rain_val > 0.8}