# backend/app/services/triggers.py

# httpx is like the requests library but works with FastAPI's async style
import httpx

# we need the API keys from our config
from app.core.config import settings

# --- thresholds ---
RAIN_THRESHOLD = 20.0      # mm per hour — IMD definition of heavy rain
HEAT_THRESHOLD = 42.0      # degrees celsius
AQI_THRESHOLD = 350        # hazardous per CPCB
ORDER_DROP_PCT = 25.0      # zone orders must drop by 25% to confirm env trigger


# checks rain using OpenWeatherMap
async def check_rain(lat: float, lon: float) -> dict:
    
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": settings.OPENWEATHER_API_KEY,
        "units": "metric",
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, timeout=10)
        data = response.json()
    
    # rainfall in last 1 hour — key won't exist if no rain so we default to 0
    rain_mm = data.get("rain", {}).get("1h", 0.0)
    triggered = rain_mm >= RAIN_THRESHOLD
    
    return {
        "trigger_type": "heavy_rain",
        "triggered": triggered,
        "raw_value": rain_mm,
        "threshold": RAIN_THRESHOLD,
        "unit": "mm/hr",
        "source": "openweathermap",
    }


# checks temperature using OpenWeatherMap
async def check_heat(lat: float, lon: float) -> dict:
    
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": settings.OPENWEATHER_API_KEY,
        "units": "metric",
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, timeout=10)
        data = response.json()
    
    temp = data["main"]["temp"]
    triggered = temp >= HEAT_THRESHOLD
    
    return {
        "trigger_type": "extreme_heat",
        "triggered": triggered,
        "raw_value": temp,
        "threshold": HEAT_THRESHOLD,
        "unit": "celsius",
        "source": "openweathermap",
    }


# checks AQI using AQICN — one simple call by city name
async def check_aqi(city: str) -> dict:
    
    url = f"https://api.waqi.info/feed/{city}/"
    params = {"token": settings.AQICN_API_KEY}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, timeout=10)
        data = response.json()
    
    # add this line temporarily to see what the API is returning
    print(data)
    
    aqi_value = 0.0
    if data.get("status") == "ok":
        aqi_value = float(data["data"]["aqi"])
    
    triggered = aqi_value >= AQI_THRESHOLD
    
    return {
        "trigger_type": "severe_aqi",
        "triggered": triggered,
        "raw_value": aqi_value,
        "threshold": AQI_THRESHOLD,
        "unit": "AQI",
        "source": "aqicn",
    }


# for environmental triggers we need BOTH the env condition AND a 25% order drop
def dual_validate(env_result: dict, current_orders: int, baseline_orders: float) -> dict:
    
    # calculate how much orders dropped vs baseline
    if baseline_orders > 0:
        drop_pct = (baseline_orders - current_orders) / baseline_orders * 100
    else:
        drop_pct = 0.0
    
    # both must be true for disruption day to be confirmed
    order_drop_triggered = drop_pct >= ORDER_DROP_PCT
    confirmed = env_result["triggered"] and order_drop_triggered
    
    env_result["order_drop_pct"] = round(drop_pct, 2)
    env_result["order_drop_triggered"] = order_drop_triggered
    env_result["confirmed"] = confirmed
    
    return env_result


# mocked — no real govt API exists for curfew
def check_curfew(zone: str) -> dict:
    
    active_curfews = {}  # add zone: True here to simulate a curfew
    is_active = active_curfews.get(zone, False)
    
    return {
        "trigger_type": "curfew",
        "triggered": is_active,
        "confirmed": is_active,
        "source": "govt_feed_mocked",
        "detail": f"Curfew active in {zone}" if is_active else "No active curfew",
    }


# mocked — no public status API for Zepto/Blinkit
def check_platform_outage(platform: str) -> dict:
    
    active_outages = {}  # add platform: hours here to simulate outage
    downtime_hours = active_outages.get(platform.lower(), 0.0)
    triggered = downtime_hours >= 3.0
    
    return {
        "trigger_type": "platform_outage",
        "triggered": triggered,
        "confirmed": triggered,
        "raw_value": downtime_hours,
        "threshold": 3.0,
        "unit": "hours",
        "source": "platform_status_mocked",
    }